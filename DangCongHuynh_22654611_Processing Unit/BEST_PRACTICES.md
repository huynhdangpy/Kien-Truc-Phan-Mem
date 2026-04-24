# 💡 Best Practices & Code Examples

## 1. Write-Side Best Practices

### ✅ DO

#### 1.1 Validate Early

```java
// ✅ GOOD - Validate inputs early
@Transactional
public ProductEntity createProduct(ProductEvent event) {
    validateProductEvent(event);  // Fail fast

    ProductEntity product = new ProductEntity();
    product.setProductId(event.getProductId());
    // ... rest of logic
    return productRepository.save(product);
}

private void validateProductEvent(ProductEvent event) {
    if (event.getProductId() == null || event.getProductId() <= 0) {
        throw new IllegalArgumentException("Product ID phải > 0");
    }
    // More validations...
}
```

#### 1.2 Use Transactions

```java
// ✅ GOOD - Atomic operation
@Transactional  // Spring handles transaction management
public ProductEntity updateProduct(ProductEvent event) {
    ProductEntity product = productRepository.findById(event.getProductId())
        .orElseThrow(() -> new RuntimeException("Not found"));

    // Update in single transaction
    product.setProductName(event.getProductName());
    product.setPrice(event.getPrice());

    return productRepository.save(product);
}
```

#### 1.3 Handle Exceptions Properly

```java
// ✅ GOOD - Specific exception handling
@Transactional
public ProductEntity createProduct(ProductEvent event) {
    try {
        validateProductEvent(event);
        ProductEntity product = new ProductEntity();
        product.setProductId(event.getProductId());
        return productRepository.save(product);
    } catch (IllegalArgumentException e) {
        logger.error("Validation failed: {}", e.getMessage());
        throw e;  // Re-throw for controller to handle
    } catch (DataIntegrityViolationException e) {
        logger.error("Duplicate product ID: {}", event.getProductId());
        throw new RuntimeException("Product already exists", e);
    } catch (Exception e) {
        logger.error("Unexpected error: {}", e.getMessage(), e);
        throw new RuntimeException("Cannot create product", e);
    }
}
```

#### 1.4 Publish Events Reliably

```java
// ✅ GOOD - Error handling for event publishing
private void publishEvent(ProductEvent event) {
    try {
        rabbitTemplate.convertAndSend(
            "product-exchange",
            "product.read",
            event
        );
        logger.info("Event published: {}", event);
    } catch (AmqpException e) {
        logger.error("Failed to publish event: {}", e.getMessage());

        // Option 1: Retry
        retryPublishEvent(event, 3);

        // Option 2: Store to DLQ (Dead Letter Queue)
        storeEventToDLQ(event);

        // Option 3: Alert
        alertOpsTeam("Event publishing failed", event);
    }
}

// Retry mechanism
private void retryPublishEvent(ProductEvent event, int maxRetries) {
    for (int i = 0; i < maxRetries; i++) {
        try {
            Thread.sleep(1000 * (i + 1));  // Exponential backoff
            rabbitTemplate.convertAndSend("product-exchange", "product.read", event);
            logger.info("Event re-published successfully");
            return;
        } catch (Exception e) {
            logger.warn("Retry {} failed", i + 1);
        }
    }
}
```

### ❌ DON'T

#### 1.5 Avoid Direct Database Queries

```java
// ❌ BAD - Raw SQL query
public ProductEntity createProduct(ProductEvent event) {
    entityManager.createNativeQuery(
        "INSERT INTO products VALUES (?, ?, ?, ?)"
    ).setParameter(1, event.getProductId())
     .executeUpdate();  // Hard to test, security risk
    // ...
}

// ✅ GOOD - Use repository pattern
public ProductEntity createProduct(ProductEvent event) {
    ProductEntity product = new ProductEntity();
    product.setProductId(event.getProductId());
    return productRepository.save(product);  // Cleaner, safer
}
```

#### 1.6 Avoid Synchronous External Calls

```java
// ❌ BAD - Blocking external API calls
@Transactional
public ProductEntity createProduct(ProductEvent event) {
    productRepository.save(...);

    // This blocks if email service is slow!
    emailService.sendNotification(event);  // ~5 seconds

    publishEvent(event);
}

// ✅ GOOD - Use async messaging
@Transactional
public ProductEntity createProduct(ProductEvent event) {
    ProductEntity product = productRepository.save(...);
    publishEvent(event);  // Non-blocking
    // Email will be sent async via separate consumer
}
```

---

## 2. Read-Side (Consumer) Best Practices

### ✅ DO

#### 2.1 Idempotent Message Processing

```java
// ✅ GOOD - Idempotent processing (safe to process multiple times)
@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    try {
        String cacheKey = PRODUCT_CACHE_PREFIX + event.getProductId();

        // Idempotent: Setting the same value twice = same result
        redisTemplate.opsForValue().set(
            cacheKey,
            event,
            CACHE_TTL_SECONDS,
            TimeUnit.SECONDS
        );

        logger.info("Product cached: {}", cacheKey);
    } catch (Exception e) {
        logger.error("Failed to process event", e);
        // Message stays in queue, will be retried
    }
}
```

#### 2.2 Handle Duplicates

```java
// ✅ GOOD - Detect and skip duplicate events
private static Set<String> processedEventIds = ConcurrentHashMap.newKeySet();

@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    String eventId = event.getProductId() + "_" + event.getEventType();

    // Skip if already processed
    if (!processedEventIds.add(eventId)) {
        logger.warn("Duplicate event skipped: {}", eventId);
        return;
    }

    // Process event...
}
```

#### 2.3 Graceful Error Handling

```java
// ✅ GOOD - Handle different error types
@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    try {
        if (event == null || event.getProductId() == null) {
            logger.error("Invalid event, discarding");
            return;  // Discard invalid messages
        }

        String cacheKey = PRODUCT_CACHE_PREFIX + event.getProductId();
        redisTemplate.opsForValue().set(cacheKey, event, CACHE_TTL_SECONDS, TimeUnit.SECONDS);

    } catch (DataAccessException e) {
        // Redis temporarily down, will retry
        logger.error("Redis error, will retry: {}", e.getMessage());
        throw e;  // Spring will retry

    } catch (RuntimeException e) {
        // Unknown error
        logger.error("Unexpected error: {}", e.getMessage(), e);
        // Could send to DLQ here
    }
}
```

### ❌ DON'T

#### 2.4 Avoid Long Processing

```java
// ❌ BAD - Long processing blocks listener
@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    // This takes 30 seconds - blocks the listener!
    performExpensiveCalculation();

    redisTemplate.opsForValue().set(cacheKey, event, ...);
}

// ✅ GOOD - Offload expensive work to thread pool
@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    // Return quickly
    asyncExecutor.execute(() -> {
        performExpensiveCalculation();
        redisTemplate.opsForValue().set(cacheKey, event, ...);
    });
}
```

#### 2.5 Avoid Tight Coupling

```java
// ❌ BAD - Tight coupling to specific event format
@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    // Assumes exact field names, types
    String name = event.getProductName();
    Double price = event.getPrice();
}

// ✅ GOOD - Defensive programming
@RabbitListener(queues = "read-mq")
public void handleProductEvent(ProductEvent event) {
    String name = event.getProductName();
    if (name == null || name.isEmpty()) {
        logger.warn("Missing product name in event");
        return;
    }

    Double price = event.getPrice();
    if (price == null || price < 0) {
        logger.warn("Invalid price in event");
        return;
    }
}
```

---

## 3. Query-Side Best Practices

### ✅ DO

#### 3.1 Cache-First Pattern

```java
// ✅ GOOD - Always check cache first
public ProductEvent getProduct(Long productId) {
    String cacheKey = PRODUCT_CACHE_PREFIX + productId;

    // Try cache first (fast path: ~1-5ms)
    ProductEvent cachedProduct = redisTemplate.opsForValue().get(cacheKey);
    if (cachedProduct != null) {
        logger.debug("Cache hit");
        return cachedProduct;
    }

    // Fallback to database (slow path: ~50-200ms)
    logger.debug("Cache miss, querying database");
    return productRepository.findById(productId)
        .orElse(null);
}
```

#### 3.2 Monitoring Cache Health

```java
// ✅ GOOD - Track cache metrics
private AtomicLong cacheHits = new AtomicLong(0);
private AtomicLong cacheMisses = new AtomicLong(0);

public ProductEvent getProduct(Long productId) {
    String cacheKey = PRODUCT_CACHE_PREFIX + productId;
    ProductEvent product = redisTemplate.opsForValue().get(cacheKey);

    if (product != null) {
        cacheHits.incrementAndGet();
    } else {
        cacheMisses.incrementAndGet();
    }

    // Log metrics periodically
    if ((cacheHits.get() + cacheMisses.get()) % 1000 == 0) {
        long total = cacheHits.get() + cacheMisses.get();
        double hitRate = (double) cacheHits.get() / total * 100;
        logger.info("Cache hit rate: {:.2f}%", hitRate);
    }

    return product;
}
```

### ❌ DON'T

#### 3.3 Avoid Always Querying Database

```java
// ❌ BAD - Ignoring cache
public ProductEvent getProduct(Long productId) {
    // Always queries database, defeats purpose of caching!
    return productRepository.findById(productId).orElse(null);
}

// ✅ GOOD - Use cache
public ProductEvent getProduct(Long productId) {
    ProductEvent cached = redisTemplate.opsForValue()
        .get(PRODUCT_CACHE_PREFIX + productId);
    return cached != null ? cached :
        productRepository.findById(productId).orElse(null);
}
```

---

## 4. Clean Code Principles

### 4.1 Naming Conventions

```java
// ✅ GOOD - Clear, descriptive names
public void handleProductCreatedEvent(ProductEvent event) { ... }
public Double calculateTotalPrice(List<Product> products) { ... }
private boolean isValidProductId(Long id) { ... }

// ❌ BAD - Unclear, cryptic names
public void handle(ProductEvent e) { ... }
public Double calc(List<Product> p) { ... }
private boolean validate(Long i) { ... }
```

### 4.2 Single Responsibility Principle

```java
// ❌ BAD - Multiple responsibilities
class ProductService {
    public void createProductAndSendEmail(ProductEvent event) {
        // Write to DB
        // Publish event
        // Send email
        // Update analytics
    }
}

// ✅ GOOD - Single responsibility
class ProductWriteService {
    public ProductEntity createProduct(ProductEvent event) {
        // Only write to DB and publish event
    }
}

class EmailService {
    public void sendNotification(ProductEvent event) {
        // Only handle email
    }
}

class AnalyticsService {
    public void trackProductCreation(ProductEvent event) {
        // Only track analytics
    }
}
```

### 4.3 Comments & Documentation

```java
// ✅ GOOD - Comments explain WHY, not WHAT
@Transactional
public ProductEntity updateProduct(ProductEvent event) {
    // Use findById + save instead of SQL UPDATE
    // to ensure all pre/post update hooks are triggered
    ProductEntity product = productRepository.findById(event.getProductId())
        .orElseThrow(() -> new RuntimeException("Not found"));

    product.setProductName(event.getProductName());
    return productRepository.save(product);
}

// ❌ BAD - Comments state obvious
@Transactional
public ProductEntity updateProduct(ProductEvent event) {
    // Find product by ID
    ProductEntity product = productRepository.findById(event.getProductId())
        .orElseThrow(() -> new RuntimeException("Not found"));

    // Set product name
    product.setProductName(event.getProductName());

    // Save and return
    return productRepository.save(product);
}
```

### 4.4 Logging Best Practices

```java
// ✅ GOOD - Structured, informative logging
@Transactional
public ProductEntity createProduct(ProductEvent event) {
    logger.info("🔵 Write-side: Nhận yêu cầu tạo sản phẩm - Product ID: {}",
               event.getProductId());

    try {
        validateProductEvent(event);
        ProductEntity product = new ProductEntity();
        product.setProductId(event.getProductId());

        ProductEntity saved = productRepository.save(product);
        logger.info("✅ Dữ liệu đã lưu vào Database - Product ID: {}",
                   saved.getProductId());

        publishEvent(event);
        logger.info("📤 Sự kiện đã gửi lên RabbitMQ");

        return saved;
    } catch (Exception e) {
        logger.error("❌ Lỗi khi tạo sản phẩm: {}", e.getMessage(), e);
        throw new RuntimeException("Cannot create product", e);
    }
}

// ❌ BAD - Minimal, unhelpful logging
public ProductEntity createProduct(ProductEvent event) {
    logger.info("Create product");
    productRepository.save(...);
    publishEvent(event);
    logger.info("Done");
    return ...;
}
```

---

## 5. Testing Examples

### 5.1 Unit Test for WriteService

```java
@ExtendWith(MockitoExtension.class)
public class ProductWriteServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private ProductWriteService writeService;

    @Test
    void testCreateProduct_Success() {
        // Arrange
        ProductEvent event = new ProductEvent(
            1L, "Laptop", "High performance", 999.99, 50, "CREATE", "test"
        );

        ProductEntity expectedEntity = new ProductEntity(1L, "Laptop", 999.99, 50);
        when(productRepository.save(any())).thenReturn(expectedEntity);

        // Act
        ProductEntity result = writeService.createProduct(event);

        // Assert
        assertNotNull(result);
        assertEquals("Laptop", result.getProductName());
        verify(productRepository).save(any());
        verify(rabbitTemplate).convertAndSend(eq("product-exchange"),
                                             eq("product.read"),
                                             any());
    }

    @Test
    void testCreateProduct_InvalidId() {
        // Arrange
        ProductEvent event = new ProductEvent();
        event.setProductId(null);  // Invalid

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                    () -> writeService.createProduct(event));
    }
}
```

### 5.2 Integration Test

```java
@SpringBootTest
@TestcontainersTest
public class CqrsIntegrationTest {

    @Autowired
    private ProductWriteService writeService;

    @Autowired
    private ProductQueryService queryService;

    @Test
    void testEndToEndFlow() throws InterruptedException {
        // 1. Create product via write-side
        ProductEvent event = new ProductEvent(
            1L, "Laptop", "Test", 999.99, 50, "CREATE", "test"
        );

        writeService.createProduct(event);

        // 2. Wait for async processing
        Thread.sleep(500);  // RabbitMQ + Redis processing

        // 3. Query from read-side
        ProductQueryService.ProductDetailDTO result =
            queryService.getProductDetails(1L);

        // 4. Verify
        assertNotNull(result);
        assertEquals("Laptop", result.getProductName());
        assertEquals(999.99, result.getPrice());
    }
}
```

---

## 6. Performance Tuning Tips

### 6.1 Redis Connection Pool Tuning

```properties
# Default might be too small for high throughput
spring.redis.lettuce.pool.max-active=50    # Default: 8
spring.redis.lettuce.pool.max-idle=20      # Default: 8
spring.redis.lettuce.pool.min-idle=10      # Default: 0

# For 100k req/s, may need:
spring.redis.lettuce.pool.max-active=100
spring.redis.lettuce.pool.max-idle=50
```

### 6.2 RabbitMQ Consumer Tuning

```properties
# Increase concurrent listeners for high throughput
spring.rabbitmq.listener.simple.concurrency=50      # Default: 1
spring.rabbitmq.listener.simple.max-concurrency=100 # Default: 1

# Prefetch size
spring.rabbitmq.listener.simple.prefetch=10         # Default: 1
```

### 6.3 Database Connection Pool

```properties
# HikariCP tuning
spring.datasource.hikari.maximum-pool-size=50       # Default: 10
spring.datasource.hikari.minimum-idle=10            # Default: 10
spring.datasource.hikari.max-lifetime=1800000       # 30 minutes
```

---

**Best Practices Version:** 1.0  
**Last Updated:** 2024-04-24
