# CQRS System with RabbitMQ & Redis

## 📋 Tổng Quan

Triển khai **Command Query Responsibility Segregation (CQRS)** kết hợp với **RabbitMQ** và **Redis** để xây dựng hệ thống có hiệu suất cao (100.000+ request/giây).

### Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (BE)                        │
└─────────────────────────────────────────────────────────────┘
              ↓                              ↓
         WRITE (Command)              READ (Query)
              ↓                              ↓
    ┌──────────────────┐         ┌──────────────────┐
    │  Write-Services  │         │  Query Service   │
    │  (ProductWrite   │         │  (ProductQuery   │
    │   Service)       │         │   Service)       │
    └──────────────────┘         └──────────────────┘
              ↓                              ↑
         write-mq (RabbitMQ)            Cache
              ↓                              ↑
         Database                     Redis Server
              ↓                         (100k req/s)
    [product_table]                [product:*]
              ↓
    Trigger Event
              ↓
         read-mq (RabbitMQ)
              ↓
    ┌──────────────────┐
    │  Read-Services   │
    │  (ProductRead    │
    │   Service)       │
    │  [Listener]      │
    └──────────────────┘
              ↓
         Redis Update
```

---

## 🏗️ Cấu Trúc Project

```
src/main/java/com/cqrs/
├── CqrsApplication.java              # Main entry point
├── event/
│   └── ProductEvent.java             # DTO cho message
├── config/
│   ├── RabbitMQConfig.java          # RabbitMQ setup
│   └── RedisConfig.java             # Redis setup
├── write/
│   ├── ProductEntity.java           # JPA Entity
│   ├── ProductRepository.java       # Repository
│   └── ProductWriteService.java     # Write logic
├── read/
│   └── ProductReadService.java      # Listener + Redis operations
└── query/
    ├── ProductQueryService.java     # Query logic
    └── ProductController.java       # REST API endpoints

src/main/resources/
└── application.properties            # Configuration
```

---

## 🚀 Các Thành Phần Chính

### 1. **ProductEvent (DTO)**

Truyền tải sự kiện giữa các dịch vụ qua RabbitMQ.

```java
ProductEvent event = new ProductEvent(
    1L,                    // productId
    "Laptop Dell",         // productName
    "High performance",    // description
    999.99,                // price
    50,                    // quantity
    "CREATE",              // eventType
    "write-services"       // source
);
```

### 2. **Write-Side Logic (ProductWriteService)**

**Quy trình:**

1. Tiếp nhận yêu cầu ghi (Create/Update/Delete)
2. Validate dữ liệu
3. Ghi vào Database chính
4. Phát hành sự kiện lên RabbitMQ
5. Read-side sẽ lắng nghe và cập nhật Redis

```java
// Tạo sản phẩm
ProductEntity product = writeService.createProduct(event);

// Cập nhật
product = writeService.updateProduct(event);

// Xóa
writeService.deleteProduct(productId);
```

**Flow:**

```
User Request → Validate → Write to DB → Publish Event → RabbitMQ
                                              ↓
                                        Read-side lắng nghe
                                              ↓
                                        Update Redis
```

### 3. **Read-Side Logic (ProductReadService)**

**Listener:** Lắng nghe từ `read-mq` queue

- **CREATE event:** Lưu vào Redis
- **UPDATE event:** Cập nhật Redis
- **DELETE event:** Xóa khỏi Redis

```java
@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    // Xử lý event và cập nhật Redis
}
```

**TTL (Time To Live):** 24 giờ (86400 giây)

- Dữ liệu tự động xóa sau 24 giờ
- Tránh Redis bloat

### 4. **Query Logic (ProductQueryService + ProductController)**

**Query Service:** Xử lý các yêu cầu đọc từ Redis

```java
// Lấy toàn bộ thông tin
ProductDetailDTO product = queryService.getProductDetails(1L);

// Lấy riêng giá
Double price = queryService.getProductPrice(1L);

// Lấy số lượng
Integer quantity = queryService.getProductQuantity(1L);

// Kiểm tra tồn tại
boolean exists = queryService.isProductExists(1L);
```

**Performance:**

- Redis lookup: ~1-5ms
- Network latency: ~1-2ms
- **Total response time: ~2-7ms** ✨

---

## 📡 API Endpoints

### Write Endpoints (Command)

| Method   | URL                  | Mô Tả             |
| -------- | -------------------- | ----------------- |
| `POST`   | `/api/products`      | Tạo sản phẩm mới  |
| `PUT`    | `/api/products/{id}` | Cập nhật sản phẩm |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm      |

**Example - Create Product:**

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "productName": "Laptop Dell XPS",
    "description": "High performance laptop",
    "price": 1299.99,
    "quantity": 50
  }'
```

### Read Endpoints (Query)

| Method | URL                           | Mô Tả                  | Response Time |
| ------ | ----------------------------- | ---------------------- | ------------- |
| `GET`  | `/api/products/{id}`          | Lấy thông tin chi tiết | ~2-7ms        |
| `GET`  | `/api/products/{id}/price`    | Lấy giá                | ~2-7ms        |
| `GET`  | `/api/products/{id}/quantity` | Lấy số lượng           | ~2-7ms        |
| `GET`  | `/api/products/{id}/exists`   | Kiểm tra tồn tại       | ~2-7ms        |

**Example - Get Product:**

```bash
curl http://localhost:8080/api/products/1
```

**Response:**

```json
{
  "message": "Thành công",
  "data": {
    "productId": 1,
    "productName": "Laptop Dell XPS",
    "description": "High performance laptop",
    "price": 1299.99,
    "quantity": 50,
    "lastUpdated": "2024-04-24T10:30:00"
  },
  "statusCode": 200
}
```

---

## 🛠️ Cài Đặt & Chạy

### 1. **Cài đặt Dependencies**

```bash
# Maven
mvn clean install

# Hoặc với Gradle
gradle build
```

### 2. **Chuẩn Bị Dịch Vụ**

#### MySQL

```bash
# Tạo database
CREATE DATABASE cqrs_db;
```

**application.properties:**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cqrs_db
spring.datasource.username=root
spring.datasource.password=root
```

#### RabbitMQ

```bash
# Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Hoặc install trực tiếp: https://www.rabbitmq.com/download.html
```

**application.properties:**

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
```

#### Redis

```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:latest

# Hoặc install: https://redis.io/download
```

**application.properties:**

```properties
spring.redis.host=localhost
spring.redis.port=6379
```

### 3. **Chạy Application**

```bash
# Maven
mvn spring-boot:run

# Hoặc chạy main class CqrsApplication
java -jar target/cqrs-system-1.0.0.jar
```

**Output:**

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_|\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.1.5)

2024-04-24 10:30:00 - Application started in 3.215 seconds
```

---

## 🔍 Monitoring

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

**Response:**

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "redis": { "status": "UP" },
    "rabbit": { "status": "UP" }
  }
}
```

### Metrics

```bash
curl http://localhost:8080/actuator/metrics
```

---

## ⚡ Performance Tips

### 1. **Redis Tuning**

```properties
# Tăng connection pool
spring.redis.lettuce.pool.max-active=50
spring.redis.lettuce.pool.max-idle=20
```

### 2. **RabbitMQ Tuning**

```properties
# Tăng concurrent listeners
spring.rabbitmq.listener.simple.concurrency=20
spring.rabbitmq.listener.simple.max-concurrency=50
```

### 3. **Database Indexing**

```sql
-- Create index trên productId (primary key)
CREATE INDEX idx_product_id ON products(product_id);
```

### 4. **Connection Pooling**

```properties
# HikariCP for Database
spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.minimum-idle=5
```

---

## 🧪 Testing

### Unit Test Example

```java
@Test
void testCreateProduct() {
    ProductEvent event = new ProductEvent(...);
    ProductEntity result = writeService.createProduct(event);

    assertNotNull(result);
    assertEquals("Laptop", result.getProductName());
}
```

### Integration Test

```bash
mvn test
```

---

## 📊 Điểm Mạnh & Điểm Yếu

### ✅ Điểm Mạnh

- **High Performance:** 100.000+ req/s từ Redis
- **Scalability:** Scale read & write độc lập
- **Consistency:** Event sourcing, audit trail
- **Fault Tolerance:** Async processing, queue persistence

### ⚠️ Điểm Yếu

- **Complexity:** Cấu trúc phức tạp hơn monolith
- **Eventual Consistency:** Delay giữa write & read
- **Operational Overhead:** Cần monitor multiple systems

---

## 🎯 Use Cases

✅ **Phù hợp với:**

- Hệ thống yêu cầu read performance cao
- Ứng dụng với read-write ratio lệch (nhiều read)
- Microservices với async processing
- Real-time analytics, notifications

❌ **Không phù hợp:**

- Ứng dụng yêu cầu strong consistency
- Dữ liệu nhỏ, traffic thấp
- Team không có kinh nghiệm distributed systems

---

## 📚 Tham Khảo

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data Redis](https://spring.io/projects/spring-data-redis)
- [Spring AMQP](https://spring.io/projects/spring-amqp)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

---

## 📝 License

MIT License - Free to use for personal & commercial projects

---

**Author:** Senior Backend Engineer  
**Date:** 2024-04-24  
**Version:** 1.0.0
