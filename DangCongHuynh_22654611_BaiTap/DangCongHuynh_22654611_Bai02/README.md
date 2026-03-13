# BÀI 2: FAULT TOLERANCE TRONG MICROSERVICES

## 📋 Giới Thiệu

Dự án này m inh họa **4 kỹ thuật Fault Tolerance** thiết yếu cho các hệ thống microservices:

1. **Retry** - Tự động thử lại khi lỗi tạm thời
2. **Circuit Breaker** - Ngăn chặn cascade failures
3. **Rate Limiter** - Kiểm soát tải traffic
4. **Bulkhead** - Cách ly resources

### Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT / CONSUMER                    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Request
                      ↓
┌─────────────────────────────────────────────────────────┐
│            SERVICE A - API GATEWAY (Port 3000)           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         FAULT TOLERANCE LAYERS                  │   │
│  │                                                 │   │
│  │  1. Rate Limiter (20 req/min)                   │   │
│  │     ↓                                           │   │
│  │  2. Bulkhead (max 5 concurrent)                 │   │
│  │     ↓                                           │   │
│  │  3. Circuit Breaker (Opossum)                   │   │
│  │     ↓                                           │   │
│  │  4. Retry (3 attempts, exponential backoff)     │   │
│  │     ↓                                           │   │
│  │  HTTP Client (Axios)                            │   │
│  └─────────────────────────────────────────────────┘   │
│                      │ HTTP Request                      │
└──────────────────────┼──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│            SERVICE B - PROVIDER (Port 3001)              │
│                                                         │
│  Endpoints:                                             │
│  • /api/health    - Health check                       │
│  • /api/data      - Normal response                     │
│  • /api/slow      - Slow response (timeout test)       │
│  • /api/error     - Error response                      │
│  • /api/overload  - Overload simulation                │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Cách Cài Đặt & Chạy

### 1️⃣ Prerequisites

- Node.js >= 16.x
- npm hoặc yarn

### 2️⃣ Install Dependencies

**Service A:**

```bash
cd service-a
npm install
```

**Service B:**

```bash
cd service-b
npm install
```

### 3️⃣ Start Services

**Terminal 1 - Service B (Provider):**

```bash
cd service-b
npm start
# Output: Server running on http://localhost:3001
```

**Terminal 2 - Service A (API Gateway):**

```bash
cd service-a
npm start
# Output: Server running on http://localhost:3000
```

### 4️⃣ Run Test Scenarios

**Terminal 3:**

```bash
cd service-a
npm test
# Chạy 6 kịch bản test tự động
```

---

## 📌 Chi Tiết Các Kỹ Thuật

### 1️⃣ RETRY PATTERN

**Mục đích:**

- Tự động thử lại khi gặp lỗi tạm thời
- Xử lý network glitches, timeout tạm thời

**Cấu hình:**

```javascript
{
  maxRetries: 3,                    // Tối đa 3 lần retry
  initialDelay: 100,                // Delay ban đầu: 100ms
  backoffMultiplier: 2,             // Exponential backoff: 100 → 200 → 400ms
  maxDelay: 5000,                   // Delay tối đa: 5 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
}
```

**Flow:**

```
Request → Error?
            ↓
        Should Retry?
            ↓ YES
        Wait (delay)
            ↓
        Retry
            ↓
        Success / Max Retries Reached
```

**Lợi ích:**

- ✅ Tăng reliability (thành công hơn)
- ✅ Xử lý lỗi tạm thời tự động
- ✅ Reduce perceived latency

**Ví dụ:**

```bash
curl http://localhost:3000/api/with-retry

# Response (sau 2 lần retry):
{
  "method": "with-retry",
  "success": true,
  "data": {...}
}
```

---

### 2️⃣ CIRCUIT BREAKER PATTERN

**Mục đích:**

- Ngăn chặn cascading failures
- Fail fast thay vì chờ timeout
- Cho phép service khôi phục

**Trạng thái:**

```
CLOSED (Normal)
  ↓ (Error Rate > 50%)
OPEN (Service Down)
  ↓ (After 30 seconds)
HALF_OPEN (Testing)
  ↓ (Success) → CLOSED
  ↓ (Failure) → OPEN
```

**Cấu hình:**

```javascript
{
  timeout: 5000,                    // Request timeout
  errorThresholdPercentage: 50,     // Trigger OPEN tại 50% error rate
  resetTimeout: 30000,              // Chờ 30s trước HALF_OPEN
  volumeThreshold: 10               // Cần 10+ requests để evaluate
}
```

**Lợi ích:**

- ✅ Ngăn chặn cascade failures
- ✅ Fail fast (không waste resources)
- ✅ Tự động recovery

**Ví dụ:**

```bash
curl http://localhost:3000/api/with-circuit-breaker

# Khi circuit OPEN:
{
  "method": "with-circuit-breaker",
  "success": false,
  "error": "ServiceB Circuit Breaker is OPEN",
  "cbState": "OPEN",
  "cbStats": {
    "state": "OPEN",
    "successes": 5,
    "failures": 8,
    "successRate": "38.46%"
  }
}
```

---

### 3️⃣ RATE LIMITER PATTERN

**Mục đích:**

- Kiểm soát số lượng requests
- Ngăn chặn abuse / attack
- Tuân thủ API quota

**Cấu hình:**

```javascript
{
  maxRequests: 20,                  // 20 requests
  windowMs: 60000,                  // Per 60 seconds
}
// = 20 requests/minute
```

**Flow:**

```
Request → Count < Max?
           ↓ YES → Allow + Increment
           ↓ NO → Reject (429)
```

**Lợi ích:**

- ✅ Ngăn abuse / DDoS
- ✅ Fair usage (tất cả clients bình đẳng)
- ✅ Protect backend

**Ví dụ:**

```bash
# Request 1-3: Success
curl http://localhost:3000/api/with-rate-limiter
# Status: 200

# Request 3+: Rate Limited
curl http://localhost:3000/api/with-rate-limiter
# Status: 429
# {
#   "error": "Too Many Requests",
#   "message": "Rate limit exceeded: 20 requests per 60 seconds"
# }
```

---

### 4️⃣ BULKHEAD PATTERN

**Mục đích:**

- Cách ly resources
- Ngăn một slow service ảnh hưởng tới others
- Prevent thread pool exhaustion

**Cấu hình:**

```javascript
{
  maxConcurrent: 5,                 // Max 5 concurrent requests
  maxQueueSize: 20,                 // Max 20 in queue
  timeout: 30000,                   // Timeout
}
```

**Flow:**

```
Request → Active < Max?
           ↓ YES → Execute
           ↓ NO → Queue
              ↓
         Queue Full?
           ↓ YES → Reject (429)
           ↓ NO → Wait in Queue
```

**Ví dụ Sơ Đồ:**

```
Slot 1: [Request A] → Processing
Slot 2: [Request B] → Processing
Slot 3: [Request C] → Processing
Slot 4: [Request D] → Processing
Slot 5: [Request E] → Processing

Queue: [Request F] → [Request G] → [Request H] → ...

Khi Request A xong:
  → [Request F] moves to Slot 1
  → [Request G] moves to Queue
```

**Lợi ích:**

- ✅ Prevent resource exhaustion
- ✅ Fair resource allocation
- ✅ Predictable behavior

**Ví dụ:**

```bash
# Gửi 10 concurrent requests
curl -X GET http://localhost:3000/api/with-bulkhead &
curl -X GET http://localhost:3000/api/with-bulkhead &
...

# Kết quả:
# - Requests 1-5: Execute immediately (200)
# - Requests 6-10: Queue waiting
# - Total active: never > 5
```

---

## 🧪 Kịch Bản Test

### Scenario 1: Service B Chậm (Timeout)

```bash
cd service-a
npm test
# Hoặc chạy từng endpoint:
curl http://localhost:3000/api/with-retry
```

**Kịch bản:** Service B delay 5 giây
**Kỳ vọng:**

- No Protection: Timeout
- With Retry: Retry 3 lần, cuối cùng timeout
- With Circuit Breaker: Timeout, circuit breaker mở

---

### Scenario 2: Service B Lỗi (5xx)

```bash
# Service B trả về error 500
curl "http://localhost:3000/api/with-retry"
```

**Kỳ vọng:**

- Without retry: 1 request, fail
- With retry: 3 requests (retries), fail
- Circuit breaker: After 5+ failures, circuit OPEN

---

### Scenario 3: Rate Limiting

```bash
# Gửi > 20 requests trong 60s
for i in {1..30}; do
  curl http://localhost:3000/api/with-rate-limiter
  sleep 0.1
done
```

**Kỳ vọng:**

- Request 1-20: Success (200)
- Request 21-30: Rate Limited (429)

---

### Scenario 4: Bulkhead - Concurrent Load

```bash
# Gửi 10 concurrent requests
for i in {1..10}; do
  curl http://localhost:3000/api/with-bulkhead &
done
```

**Kỳ vọng:**

- Active requests: never > 5
- Queue length: 0-5
- All requests eventually succeed

---

### Scenario 5: Service Down

```bash
# Bring service B down
curl -X POST http://localhost:3001/admin/health/down

# Send requests
curl http://localhost:3000/api/with-circuit-breaker
# Output: Circuit OPEN

# Bring service back up
curl -X POST http://localhost:3001/admin/health/up

# Wait 30 seconds for circuit recovery
# Try again - circuit should be HALF_OPEN
```

**Kỳ vọng:**

- Initial requests: Connection errors
- Circuit state: OPEN
- Fast fail: No retry
- Recovery: After 30s, circuit tries HALF_OPEN
- Success: Circuit closes

---

## 📊 Monitoring & Admin Endpoints

### Get Overall Stats

```bash
curl http://localhost:3000/admin/stats

# Response:
{
  "circuitBreaker": {
    "state": "CLOSED",
    "successes": 45,
    "failures": 3,
    "timeouts": 0,
    "successRate": "93.75%"
  },
  "rateLimiter": {
    "name": "ServiceBRateLimiter",
    "maxRequests": 20,
    "windowMs": 60000,
    "activeRequests": 2,
    "availableRequests": 18,
    "utilization": "10.00%"
  },
  "bulkhead": {
    "name": "ServiceBBulkhead",
    "activeCount": 1,
    "maxConcurrent": 5,
    "availableSlots": 4,
    "queueLength": 0,
    "utilization": "20.00%"
  }
}
```

### Reset Individual Protections

```bash
# Reset Circuit Breaker
curl -X POST http://localhost:3000/admin/circuit-breaker/reset

# Reset Rate Limiter
curl -X POST http://localhost:3000/admin/rate-limiter/reset

# Reset Bulkhead
curl -X POST http://localhost:3000/admin/bulkhead/reset
```

### Service B Admin Endpoints

```bash
# Health control
curl -X POST http://localhost:3001/admin/health/up     # Service UP
curl -X POST http://localhost:3001/admin/health/down   # Service DOWN

# Reset counter
curl -X POST http://localhost:3001/admin/reset

# Get stats
curl http://localhost:3001/admin/stats
```

---

## 📊 API Reference

### Service A (Port 3000)

| Method | Endpoint                       | Descrip       | Protection         |
| ------ | ------------------------------ | ------------- | ------------------ |
| GET    | `/api/health`                  | Health check  | None               |
| GET    | `/api/no-protection`           | Baseline      | None               |
| GET    | `/api/with-retry`              | With Retry    | ✅ Retry           |
| GET    | `/api/with-circuit-breaker`    | With CB       | ✅ Circuit Breaker |
| GET    | `/api/with-rate-limiter`       | With RL       | ✅ Rate Limiter    |
| GET    | `/api/with-bulkhead`           | With BH       | ✅ Bulkhead        |
| GET    | `/api/with-all-protections`    | All combined  | ✅✅✅✅           |
| GET    | `/admin/stats`                 | See all stats | -                  |
| POST   | `/admin/circuit-breaker/reset` | Reset CB      | -                  |
| POST   | `/admin/rate-limiter/reset`    | Reset RL      | -                  |
| POST   | `/admin/bulkhead/reset`        | Reset BH      | -                  |

### Service B (Port 3001)

| Method | Endpoint               | Purpose             |
| ------ | ---------------------- | ------------------- |
| GET    | `/api/health`          | Health check        |
| GET    | `/api/data`            | Normal response     |
| GET    | `/api/slow?delay=5000` | Slow response       |
| GET    | `/api/error?rate=100`  | Error response      |
| GET    | `/api/overload`        | Overload simulation |
| POST   | `/admin/health/up`     | Service UP          |
| POST   | `/admin/health/down`   | Service DOWN        |
| POST   | `/admin/reset`         | Reset counter       |
| GET    | `/admin/stats`         | Get stats           |

---

## 🎯 Lợi Ích Của Mỗi Kỹ Thuật

### Retry ✅

| Lợi ích          | Mô tả                         |
| ---------------- | ----------------------------- |
| **Reliability**  | Tăng thành công từ 70% → 95%  |
| **Resilience**   | Xử lý lỗi tạm thời            |
| **Simplicity**   | Dễ implement                  |
| **Cost**         | Giảm error rate               |
| **⚠️ Trade-off** | Latency tăng (do retry delay) |

### Circuit Breaker ✅

| Lợi ích                | Mô tả                         |
| ---------------------- | ----------------------------- |
| **Cascade Prevention** | Stop cascading failures       |
| **Fast Fail**          | Reject immediately vs timeout |
| **Recovery**           | Auto-recovery với HALF_OPEN   |
| **Resource Save**      | Không waste resources         |
| **⚠️ Trade-off**       | Complexity, stateful          |

### Rate Limiter ✅

| Lợi ích             | Mô tả                     |
| ------------------- | ------------------------- |
| **DDoS Protection** | Ngăn abuse                |
| **Fair Usage**      | Equal for all clients     |
| **Cost Control**    | Tuân thủ API quota        |
| **Predictable**     | Consistent resource usage |
| **⚠️ Trade-off**    | Some clients rejected     |

### Bulkhead ✅

| Lợi ích             | Mô tả                                 |
| ------------------- | ------------------------------------- |
| **Isolation**       | Một slow service không ảnh hưởng khác |
| **Thread Pool**     | Prevent exhaustion                    |
| **Fair Allocation** | Equal slots                           |
| **Predictable**     | Consistent behavior                   |
| **⚠️ Trade-off**    | Complexity, queue management          |

---

## 💡 Best Practices

### 1. Combine Techniques

```
✅ GOOD: Retry + Circuit Breaker + Rate Limiter + Bulkhead
❌ BAD: Use only Retry (không protect từ cascades)
```

### 2. Retry Settings

```javascript
// ✅ Good exponential backoff
initialDelay: 100,     // 100ms
multiplier: 2,         // 100 → 200 → 400
maxDelay: 5000,        // Cap at 5s

// ❌ Bad fixed retry
// Just retries immediately 3 times (thundering herd)
```

### 3. Circuit Breaker Thresholds

```javascript
// ✅ Good - balanced
errorThreshold: 50%,   // Open tại 50% failures
resetTimeout: 30000,   // 30s recovery time
volumeThreshold: 10,   // Need 10+ requests to evaluate

// ❌ Bad - too aggressive
errorThreshold: 1%,    // Opens too easily
resetTimeout: 1000,    // Too quick recovery
```

### 4. Timeout Strategy

```javascript
// ✅ Good hierarchy
clientTimeout: 3000,      // Client side
circuitBreaker: 5000,     // Slightly higher
totalServiceTimeout: 10000 // Service side max

// ❌ Bad - same timeouts
// Thundering herd when cascade
```

---

## 📝 Logs & Output

### Successful Request with All Protections

```
[SERVICE-A] With All Protections - Start
[RATE-LIMITER] RateLimiter - Request allowed
[BULKHEAD] Request executing
[CIRCUIT-BREAKER] ServiceBCircuitBreaker - Request successful
[RETRY] Request - Attempt 1/4 - Success
[SERVICE-A] With All Protections - Success
```

### Rate Limited Request

```
[HTTP-RATE-LIMITER] ServiceBRateLimiter - Rate limit reached
  currentRequests: 20
  maxRequests: 20
  waitTime: 3500ms
Error: Rate limit exceeded. Please retry after 3500ms
```

### Circuit Breaker Open

```
[CIRCUIT-BREAKER] ServiceBCircuitBreaker - State changed to OPEN
[CIRCUIT-BREAKER] Request - Circuit is OPEN, request rejected
Error: ServiceBCircuitBreaker Circuit Breaker is OPEN
```

---

## 🛠️ Troubleshooting

### Q: Services not connecting

```bash
# Check if services are running
curl http://localhost:3000/api/health
curl http://localhost:3001/api/health

# Check logs for connection errors
# Ensure SERVICE_B_URL is correct
```

### Q: Circuit Breaker stuck OPEN

```bash
# Reset circuit breaker
curl -X POST http://localhost:3000/admin/circuit-breaker/reset

# Check if Service B is healthy
curl http://localhost:3001/api/health
```

### Q: Rate limiter always rejecting

```bash
# Reset rate limiter
curl -X POST http://localhost:3000/admin/rate-limiter/reset

# Wait 60 seconds for window to reset
```

### Q: Bulkhead queue full

```bash
# Reset bulkhead
curl -X POST http://localhost:3000/admin/bulkhead/reset

