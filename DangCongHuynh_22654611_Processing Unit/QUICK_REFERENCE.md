# 📌 Quick Reference Guide

## 🎯 Nhanh Chóng Hiểu Hệ Thống

### 1. Kiến Trúc 30 Giây

```
USER REQUEST
    ↓
[API Gateway] ← ProductController
    ├─ WRITE Path: POST/PUT/DELETE
    │   ├─→ ProductWriteService
    │   ├─→ MySQL Database
    │   └─→ RabbitMQ (publish event)
    │       ├─→ ProductReadService (listener)
    │       └─→ Redis Update
    │
    └─ READ Path: GET
        ├─→ ProductQueryService
        └─→ Redis Cache (~2-7ms) ⚡
```

### 2. File Structure & Responsibility

| Folder    | File                       | Responsibility                     |
| --------- | -------------------------- | ---------------------------------- |
| `event/`  | `ProductEvent.java`        | DTO cho message                    |
| `config/` | `RabbitMQConfig.java`      | Exchange, Queue, Binding setup     |
| `config/` | `RedisConfig.java`         | RedisTemplate configuration        |
| `write/`  | `ProductEntity.java`       | JPA Entity (DB schema)             |
| `write/`  | `ProductRepository.java`   | DB access layer                    |
| `write/`  | `ProductWriteService.java` | Write logic (Create/Update/Delete) |
| `read/`   | `ProductReadService.java`  | Listener + Redis operations        |
| `query/`  | `ProductQueryService.java` | Query logic (Read dari Redis)      |
| `query/`  | `ProductController.java`   | REST API endpoints                 |

### 3. Data Flow Tóm Tắt

#### Create Product

```
POST /api/products
  ↓
productRepository.save() → MySQL ✅
  ↓
rabbitTemplate.convertAndSend() → RabbitMQ
  ↓
@RabbitListener(queues="read-mq")
  ↓
redisTemplate.opsForValue().set() → Redis ✅
```

#### Read Product

```
GET /api/products/{id}
  ↓
redisTemplate.opsForValue().get() → Redis ~2ms ⚡
  ↓
Return to client (200 OK)
```

---

## 📖 Classes & Methods Map

### ProductEvent

```java
// DTO để transfer data qua RabbitMQ
ProductEvent event = new ProductEvent(
    1L,                    // productId
    "Laptop",              // productName
    "Description",         // description
    999.99,                // price
    50,                    // quantity
    "CREATE",              // eventType (CREATE/UPDATE/DELETE)
    "write-services"       // source
);
```

### ProductWriteService

```java
// Write operations
writeService.createProduct(event);    // Create
writeService.updateProduct(event);    // Update
writeService.deleteProduct(id);       // Delete
```

### ProductReadService

```java
// Listener (automatic via @RabbitListener)
handleProductEvent(event)             // Called automatically

// Manual operations
productReadService.getProductFromCache(id);  // Get from Redis
productReadService.deleteProductFromCache(id);  // Manual delete
productReadService.invalidateAllCache();       // Clear all cache
```

### ProductQueryService

```java
// Query operations
queryService.getProductById(1L);           // Get detail
queryService.getProductPrice(1L);          // Get price
queryService.getProductQuantity(1L);       // Get quantity
queryService.isProductExists(1L);          // Check exists
queryService.getProductDetails(1L);        // Get DTO
```

### ProductController (REST API)

```java
// WRITE Endpoints
POST   /api/products               // Create
PUT    /api/products/{id}          // Update
DELETE /api/products/{id}          // Delete

// READ Endpoints (~2-7ms each)
GET    /api/products/{id}          // Get detail
GET    /api/products/{id}/price    // Get price
GET    /api/products/{id}/quantity // Get quantity
GET    /api/products/{id}/exists   // Check exists
```

---

## 🔧 Configuration Quick Reference

### RabbitMQ Setup

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.listener.simple.concurrency=10
```

**Default Queues:**

- `write-mq`: Write-side queue
- `read-mq`: Read-side queue
- Exchange: `product-exchange` (Direct)
- Routing keys: `product.write`, `product.read`

### Redis Setup

```properties
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.lettuce.pool.max-active=20
```

**Cache Keys Pattern:**

- `product:{productId}` → Stores ProductEvent

### MySQL Setup

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cqrs_db
spring.datasource.username=root
spring.datasource.password=root
```

**Table:**

- `products` → Stores ProductEntity

---

## ⚡ Performance Metrics

| Operation           | Latency | Throughput         | Location |
| ------------------- | ------- | ------------------ | -------- |
| Write to MySQL      | ~5-50ms | ~1000-5000 req/s   | Database |
| Publish to RabbitMQ | ~1-10ms | N/A                | Queue    |
| Read from Redis     | ~1-5ms  | **100,000+ req/s** | Cache ⚡ |
| Network RTT         | ~1-2ms  | N/A                | Network  |

**Example Response Time Breakdown:**

```
GET /api/products/1
├─ Validation: 0.1ms
├─ Redis lookup: 2-5ms
├─ Serialization: 0.5ms
└─ Network: 1-2ms
────────────────────
Total: ~3-8ms ⚡
```

---

## 🚀 Chạy Ứng Dụng

### Step 1: Start Services

```bash
# Terminal 1 - MySQL
docker run -e MYSQL_ROOT_PASSWORD=root -d -p 3306:3306 mysql:8.0

# Terminal 2 - RabbitMQ
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Terminal 3 - Redis
docker run -d -p 6379:6379 redis:latest
```

### Step 2: Build & Run App

```bash
cd "DangCongHuynh_22654611_Processing Unit"

# Build
mvn clean install

# Run
mvn spring-boot:run

# Or
java -jar target/cqrs-system-1.0.0.jar
```

**Output:**

```
Application started in 3.215 seconds
Tomcat started on port(s): 8080
```

### Step 3: Test with curl

```bash
# Create product
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"productName":"Laptop","price":999.99,"quantity":50}'

# Get product (từ Redis!)
curl http://localhost:8080/api/products/1

# Get price
curl http://localhost:8080/api/products/1/price

# Check exists
curl http://localhost:8080/api/products/1/exists
```

---

## 🐛 Troubleshooting

### Problem: "Connection refused to Redis"

```
Error: Unable to connect to Redis at localhost:6379

Solution:
- Check Redis running: redis-cli ping
- Update spring.redis.host in application.properties
- Check port: netstat -an | grep 6379
```

### Problem: "RabbitMQ queue not created"

```
Error: NOT_FOUND - no queue 'read-mq'

Solution:
- RabbitMQConfig beans must be loaded
- Check @Configuration class loaded
- Restart Spring Boot application
- Check RabbitMQ admin UI: http://localhost:15672
```

### Problem: "Cache miss on all reads"

```
Symptom: GET /api/products/{id} always returns null

Solution:
- Ensure ProductReadService listener is active
- Check RabbitMQ messages being processed
- Verify Redis connection: redis-cli
- Check logs for consumer errors
```

### Problem: "High latency on writes"

```
Symptom: POST takes >1 second

Solution:
- Increase MySQL connection pool: hikari.maximum-pool-size=50
- Check database slow log: SHOW PROCESSLIST;
- Add index: CREATE INDEX idx_product_id ON products(product_id);
```

---

## 📊 Monitoring Checklist

- [ ] Redis connectivity: `redis-cli ping` → PONG
- [ ] RabbitMQ UI: http://localhost:15672 (guest/guest)
- [ ] App health: http://localhost:8080/actuator/health → UP
- [ ] Database connection: Test with `select 1`
- [ ] Consumer lag: Check RabbitMQ queue depth → should be ~0
- [ ] Cache hit rate: Monitor logs for "Cache hit" ratio

---

## 📚 Documentation Files

| File                     | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `README.md`              | Setup, API endpoints, features             |
| `ARCHITECTURE.md`        | Deep dive on design, patterns, scalability |
| `BEST_PRACTICES.md`      | Code examples, dos & don'ts, testing       |
| `pom.xml`                | Maven dependencies                         |
| `application.properties` | Configuration                              |

---

## ✅ Checklist - Sebelum Deploy

- [ ] Semua services running (MySQL, RabbitMQ, Redis)
- [ ] `mvn clean install` success
- [ ] App starts without errors
- [ ] Health check: `/actuator/health` → UP
- [ ] Create test: `POST /api/products` → 201
- [ ] Read test: `GET /api/products/1` → 200
- [ ] Redis cache working: Verify data cached
- [ ] Logging format correct: Check logs
- [ ] Error handling working: Test with invalid data
- [ ] Performance acceptable: ~2-7ms read time

---

## 🎓 Learning Path

1. **Day 1:** Understand CQRS concept
   - Read: ARCHITECTURE.md
   - Focus: Event Sourcing pattern

2. **Day 2:** Code walkthrough
   - Read: ProductWriteService.java
   - Read: ProductReadService.java

3. **Day 3:** Setup & Run
   - Install: Docker + MySQL + RabbitMQ + Redis
   - Run: Application
   - Test: API endpoints

4. **Day 4:** Advanced
   - Read: BEST_PRACTICES.md
   - Implement: Error handling, retry logic
   - Tune: Performance configs

---

**Last Updated:** 2024-04-24  
**Version:** 1.0  
**Status:** Ready for Study
