# 📐 System Architecture - Chi Tiết Thiết Kế

## 1. Khái Niệm CQRS

**CQRS = Command Query Responsibility Segregation**

Tách biệt model cho **Write** (Command) và **Read** (Query):

- **Write Model:** Tối ưu hóa cho consistency, transactions
- **Read Model:** Tối ưu hóa cho performance, queries

```
┌──────────────────────────────────────────────────────┐
│            Single Unified Model (Truyền thống)      │
│  Write: INSERT/UPDATE/DELETE (slow)                 │
│  Read: SELECT (slow khi data lớn)                   │
└──────────────────────────────────────────────────────┘

vs

┌──────────────────────────────────────────────────────┐
│  Write Model (Primary DB)  │  Read Model (Redis)    │
│  - Consistency             │  - Performance         │
│  - Transactional           │  - ~100k req/s         │
│  - Normalized              │  - Denormalized        │
└──────────────────────────────────────────────────────┘
```

---

## 2. Data Flow - Chi Tiết

### Scenario 1: Tạo Sản Phẩm (CREATE)

```
1. API Request
   └─→ POST /api/products
       {
         "productId": 1,
         "productName": "Laptop",
         "price": 1000
       }

2. ProductWriteService.createProduct()
   ├─→ Validate dữ liệu
   │  └─ Check: productId > 0, price >= 0, name != null
   │
   ├─→ Write to MySQL Database
   │  └─ INSERT INTO products VALUES (1, 'Laptop', 1000, 50)
   │
   └─→ Publish Event to RabbitMQ
      ├─ Exchange: product-exchange
      ├─ Routing Key: product.read
      └─ Payload:
         {
           "productId": 1,
           "productName": "Laptop",
           "eventType": "CREATE",
           "timestamp": "2024-04-24T10:30:00"
         }

3. RabbitMQ Routing
   ├─ Direct Exchange phân tích routing key
   ├─ Match với binding: "product.read"
   └─ Forward to queue: read-mq

4. ProductReadService Listener
   ├─ @RabbitListener(queues = "read-mq")
   ├─ Nhận ProductEvent từ message
   ├─ handleCreateEvent()
   │  ├─ Validate event
   │  ├─ Generate cache key: "product:1"
   │  ├─ Set to Redis
   │  │  └─ redisTemplate.opsForValue().set(
   │  │       "product:1",
   │  │       productEvent,
   │  │       86400,  // 24 hours TTL
   │  │       TimeUnit.SECONDS
   │  │     )
   │  └─ Log success
   │
   └─ Redis Update Complete ✅

5. API Response
   └─→ 201 CREATED
       {
         "message": "Sản phẩm đã tạo thành công",
         "data": {
           "productId": 1,
           "productName": "Laptop",
           ...
         }
       }
```

### Scenario 2: Đọc Sản Phẩm (READ)

```
1. API Request
   └─→ GET /api/products/1

2. ProductController.getProduct(1)
   └─→ ProductQueryService.getProductDetails(1)

3. ProductQueryService
   ├─ Validate: productId > 0
   ├─ Call: productReadService.getProductFromCache(1)
   │
   └─→ ProductReadService.getProductFromCache()
       ├─ Generate cache key: "product:1"
       ├─ Query Redis: redisTemplate.opsForValue().get("product:1")
       │  │
       │  └─→ Redis Response (~1-5ms)
       │
       └─ Return ProductEvent

4. Map to DTO
   └─→ ProductDetailDTO

5. API Response
   └─→ 200 OK (~2-7ms total)
       {
         "productId": 1,
         "productName": "Laptop",
         "price": 1000,
         "quantity": 50,
         "lastUpdated": "2024-04-24T10:30:00"
       }
```

---

## 3. Technology Stack - Lựa Chọn Thiết Kế

### Why RabbitMQ?

| Feature         | RabbitMQ                  | Kafka            | AWS SQS         |
| --------------- | ------------------------- | ---------------- | --------------- |
| **Reliability** | ✅ Persistence            | ✅ High          | ⚠️ Limited      |
| **Latency**     | ~10ms                     | ~100ms           | ~100ms          |
| **Ordering**    | ✅ Per queue              | ✅ Per partition | ❌ No           |
| **Setup**       | Easy                      | Complex          | Cloud-dependent |
| **Use Case**    | **Traditional Messaging** | Big Data         | AWS Ecosystem   |

**Lựa chọn RabbitMQ vì:**

- ✅ Low latency (<10ms)
- ✅ Flexible routing (Direct Exchange)
- ✅ Message persistence
- ✅ Dễ setup & maintain

### Why Redis?

| Feature             | Redis           | Memcached  | In-Memory DB |
| ------------------- | --------------- | ---------- | ------------ |
| **Speed**           | ~1-5ms          | ~1-5ms     | ~1-5ms       |
| **Data Structures** | ✅ Rich         | ❌ Simple  | ✅ Rich      |
| **Persistence**     | ✅ RDB, AOF     | ❌ No      | ✅ Yes       |
| **Replication**     | ✅ Master-Slave | ✅ Limited | ✅ Yes       |
| **Throughput**      | **100k req/s**  | ~50k req/s | Variable     |

**Lựa chọn Redis vì:**

- ✅ Ultra-fast in-memory access
- ✅ Built-in TTL (Time To Live)
- ✅ Persistence options (RDB, AOF)
- ✅ Pub/Sub capabilities
- ✅ High throughput

### Why MySQL?

| Feature             | MySQL           | PostgreSQL  | NoSQL           |
| ------------------- | --------------- | ----------- | --------------- |
| **ACID**            | ✅ Yes          | ✅ Yes      | ⚠️ Eventual     |
| **Complex Queries** | ✅ Yes          | ✅ Yes      | ❌ Limited      |
| **Scalability**     | ⚠️ Vertical     | ⚠️ Vertical | ✅ Horizontal   |
| **Maturity**        | ✅ Stable       | ✅ Stable   | ✅ Evolved      |
| **Use Case**        | **Write Model** | Analytics   | Flexible Schema |

**Lựa chọn MySQL vì:**

- ✅ ACID transactions (consistency cho write-side)
- ✅ Complex relationships
- ✅ Well-known & mature
- ✅ Perfect fit cho write model

---

## 4. Architectural Patterns

### Pattern 1: Event Sourcing

```
Mỗi thay đổi được lưu trữ như một sự kiện (immutable)

Timeline:
T=0: CREATE Product(1, 'Laptop', 1000)
T=5: UPDATE Product(1, price=950)
T=10: UPDATE Product(1, quantity=49)

Audit Trail: Tất cả thay đổi được ghi lại
Replay: Có thể rebuild state từ events
```

### Pattern 2: Asynchronous Processing

```
Traditional (Synchronous):
API Request → DB Write → Wait → Response
└─ Blocking, slow nếu DB slow

CQRS (Asynchronous):
API Request → DB Write → Return immediately → RabbitMQ → Redis Update
└─ Non-blocking, fast response time
```

### Pattern 3: Eventual Consistency

```
Write-side: DB updated immediately
            ↓
Read-side: Redis update via async message

Timeline:
T=0ms:  Product written to DB (visible to transactions)
T=1ms:  Event published to RabbitMQ
T=5ms:  Event received by read-side listener
T=7ms:  Redis cache updated
T=10ms: GET request sees updated data

Gap: 0-10ms (acceptable cho most use cases)
```

---

## 5. Error Handling Strategy

### Scenario 1: RabbitMQ Temporarily Down

```
Write Request → Write to DB ✅ → Try to publish event ❌
                                    └─ Retry logic (3x)
                                    └─ Dead Letter Queue (DLQ)
                                    └─ Alert ops team

Result: Data safe in DB, event will retry
```

### Scenario 2: Redis Down

```
Read Request → Query Cache ❌ → Fallback to DB query
                                 └─ Slower (~50-200ms)
                                 └─ Degraded performance
                                 └─ Service still works

Result: Service continues with lower performance
```

### Scenario 3: Database Connection Error

```
Write Request → Validate ✅ → Connect to DB ❌
                              └─ Throw exception
                              └─ Return 500 Internal Server Error
                              └─ Client can retry

Result: Write fails safely, no data corruption
```

---

## 6. Scaling Strategy

### Horizontal Scaling - Read-Side

```
┌──────────────┐
│ Redis Server │
│  (2GB RAM)   │
└──────────────┘
       ↑
       │ (100k req/s)
       │
   ┌───┼───────────┐
   │   │           │
 Read-1 Read-2   Read-3  (Load balanced)
(Replicas)

Scale: Add more Read replicas
Result: Each replica handles ~30k req/s
```

### Vertical Scaling - Write-Side

```
Single Write Instance
┌─────────────────────────────────────┐
│  ProductWriteService                │
│  - Thread pool: 20 threads          │
│  - Queue depth: 1000 requests       │
│  - Can handle: ~5000 writes/s       │
└─────────────────────────────────────┘

Bottleneck: MySQL write speed (~1000-5000 writes/s)
Solution: Implement write batching, connection pooling
```

---

## 7. Monitoring & Observability

### Metrics to Track

```
1. Write-Side Metrics
   - Write latency: Time to persist to DB (< 50ms)
   - Event publish latency: Time to send to RabbitMQ (< 10ms)
   - Error rate: % of failed writes

2. Read-Side Metrics
   - Redis hit rate: % of successful cache lookups (> 95%)
   - Cache latency: Time to retrieve from Redis (< 5ms)
   - Event processing lag: Delay from RabbitMQ to Redis
   - Consumer lag: Unprocessed messages in queue

3. System Health
   - RabbitMQ queue depth: Should be ~0
   - Redis memory usage: Monitor for leaks
   - Database connection pool: Ensure not exhausted
```

### Logging

```
Log Levels:
- DEBUG: Detailed flow, cache operations
- INFO: Write events, consumer processing
- WARN: Cache misses, slow queries
- ERROR: Exceptions, failed operations

Examples:
📝 INFO: Write-side: Nhận yêu cầu tạo sản phẩm - Product ID: 1
📨 DEBUG: Read-side: Nhận sự kiện từ RabbitMQ
✅ INFO: Dữ liệu đã lưu vào Database - Product ID: 1
❌ ERROR: Lỗi khi gửi sự kiện lên RabbitMQ
```

---

## 8. Security Considerations

### Authentication & Authorization

```java
@GetMapping("/{id}")
@PreAuthorize("hasRole('USER')")
public ResponseEntity<?> getProduct(@PathVariable Long id) {
    // Only authenticated users can read
}

@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createProduct(@RequestBody ProductEvent event) {
    // Only admins can write
}
```

### Data Encryption

```properties
# Redis encryption (in-transit)
spring.redis.ssl=true

# Database encryption (MySQL SSL)
spring.datasource.url=jdbc:mysql://localhost:3306/cqrs_db?useSSL=true
```

### Input Validation

```java
private void validateProductEvent(ProductEvent event) {
    if (event.getProductId() == null || event.getProductId() <= 0) {
        throw new IllegalArgumentException("Product ID phải > 0");
    }
    // Prevent SQL injection, XSS, etc.
}
```

---

## 9. Trade-offs & Considerations

### Pros ✅

- **High Performance:** 100k+ req/s từ Redis
- **Scalability:** Independent scaling for read/write
- **Resilience:** Async processing, fault tolerance
- **Auditability:** Event sourcing provides full history

### Cons ❌

- **Complexity:** More components to manage
- **Eventual Consistency:** Delay between write & read
- **Operational Overhead:** Multiple databases to monitor
- **Testing Complexity:** Async behavior harder to test

### When to Use

✅ High read throughput, can tolerate eventual consistency
✅ E-commerce, analytics, real-time dashboards
❌ Banking (need strong consistency)
❌ Small projects (over-engineered)

---

## 10. Future Improvements

```
1. Caching Layer Improvement
   - Redis Cluster for high availability
   - Implement cache warming strategy
   - Add cache invalidation TTL tuning

2. Event Stream
   - Add Kafka for event streaming
   - Event replay capability
   - Temporal queries (time-travel queries)

3. Monitoring
   - Add Prometheus metrics
   - Implement distributed tracing (Jaeger)
   - Real-time alerting

4. Optimization
   - Connection pooling optimization
   - Batch processing for bulk writes
   - Read replicas for database
```

---

**Architecture Review Date:** 2024-04-24  
**Version:** 1.0  
**Status:** Production Ready
