# QUICK REFERENCE - Fault Tolerance Cheat Sheet

## 🚀 KHỞI ĐỘNG NHANH

### Terminal 1: Service B

```bash
cd service-b && npm install && npm start
# Output: Server on http://localhost:3001
```

### Terminal 2: Service A

```bash
cd service-a && npm install && npm start
# Output: Server on http://localhost:3000
```

### Terminal 3: Run Tests

```bash
cd service-a && npm test
# Runs 6 automated test scenarios
```

---

## 🔗 QUICK API CALLS

### Healthy Request

```bash
curl http://localhost:3000/api/with-all-protections
```

### See All Stats

```bash
curl http://localhost:3000/admin/stats | jq
```

### Trigger Failure

```bash
# Bring Service B down
curl -X POST http://localhost:3001/admin/health/down

# Watch circuit breaker open
curl http://localhost:3000/api/with-circuit-breaker

# Bring Service B back
curl -X POST http://localhost:3001/admin/health/up
```

---

## 📊 EACH TECHNIQUE AT A GLANCE

### RETRY

```
Purpose:     Auto-retry on failure
When:        Network timeouts, 500 errors
Config:      maxRetries: 3, delay: 100ms × 2^n
Endpoint:    /api/with-retry
Success:     3 requests → 1 success (auto-retry)
Failure:     3 requests still fail → error
```

### CIRCUIT BREAKER

```
Purpose:     Prevent cascading failures
When:        Service down, too many errors
Config:      errorThreshold: 50%, resetTimeout: 30s
Endpoint:    /api/with-circuit-breaker
States:      CLOSED → OPEN → HALF_OPEN → CLOSED
Result:      Service down → fast fail (< 1ms)
```

### RATE LIMITER

```
Purpose:     Prevent abuse/overload
When:        API quota exceeded
Config:      maxRequests: 20, windowMs: 60000ms
Endpoint:    /api/with-rate-limiter
Success:     20 requests in 60s ✓
Failure:     21st request → 429 Too Many Requests
```

### BULKHEAD

```
Purpose:     Isolate resources
When:        Concurrent requests > 5
Config:      maxConcurrent: 5, maxQueueSize: 20
Endpoint:    /api/with-bulkhead
Active:      Slots: 0-5 active
Queue:       Waiting: 0-20 queued
Result:      10 requests → 5 active + 5 queued
```

### ALL TOGETHER

```
Purpose:     Production-ready protection
Config:      All 4 techniques combined
Endpoint:    /api/with-all-protections ⭐
Result:      System resilient to failures
```

---

## 🧪 TEST PATTERNS

### Test 1: Normal Request

```bash
curl http://localhost:3000/api/with-all-protections
# Status: 200 ✓
```

### Test 2: Stress Test (30 requests)

```bash
for i in {1..30}; do
  curl http://localhost:3000/api/with-rate-limiter &
done
wait
# Results: 20 success, 10 rate-limited
```

### Test 3: Service Down Test

```bash
curl -X POST http://localhost:3001/admin/health/down
for i in {1..5}; do
  curl http://localhost:3000/api/with-circuit-breaker
done
# Results: Circuit opens, fast fail
```

### Test 4: Concurrent Load (Bulkhead)

```bash
for i in {1..15}; do
  curl http://localhost:3000/api/with-bulkhead &
done
wait
# Results: All succeed, max 5 concurrent
```

---

## 📋 COMPARISON TABLE

| Aspect         | Retry          | Circuit Breaker | Rate Limiter  | Bulkhead  |
| -------------- | -------------- | --------------- | ------------- | --------- |
| **Purpose**    | Recover        | Fail fast       | Prevent abuse | Isolate   |
| **Latency**    | Higher         | Lower           | Same          | Same      |
| **Throughput** | Same           | Better          | Lower         | Better    |
| **Complexity** | Low            | Medium          | Low           | Medium    |
| **Recovery**   | Auto           | Manual (30s)    | Auto          | Auto      |
| **Use When**   | Temporary fail | Service down    | Quota limit   | High load |

---

## ⚙️ CONFIGURATION QUICK EDIT

### To Change Retry

**File:** service-a/server.js

```javascript
// Line: new RetryManager({
const retryManager = new RetryManager({
  maxRetries: 3, // ← Change this
  initialDelay: 100, // ← Or this
  backoffMultiplier: 2, // ← Or this
  maxDelay: 5000,
});
```

### To Change Circuit Breaker

**File:** service-a/server.js

```javascript
// Line: new CircuitBreakerManager({
const circuitBreakerManager = new CircuitBreakerManager({
  timeout: 5000, // ← Change this
  errorThresholdPercentage: 50, // ← Or this
  resetTimeout: 30000, // ← Or this
});
```

### To Change Rate Limiter

**File:** service-a/server.js

```javascript
// Line: new HttpClientRateLimiter({
const rateLimiter = new HttpClientRateLimiter({
  maxRequests: 20, // ← Change this
  windowMs: 60000, // ← Or this
});
```

### To Change Bulkhead

**File:** service-a/server.js

```javascript
// Line: new BulkheadManager({
const bulkheadManager = new BulkheadManager({
  maxConcurrent: 5, // ← Change this
  maxQueueSize: 20, // ← Or this
  timeout: 30000,
});
```

After changes: Restart Service A (`Ctrl+C` then `npm start`)

---

## 🔍 MONITORING COMMANDS

```bash
# Real-time stats
watch -n 1 "curl -s http://localhost:3000/admin/stats | jq"

# Circuit breaker state only
curl -s http://localhost:3000/admin/stats | jq '.circuitBreaker.state'

# Rate limiter usage
curl -s http://localhost:3000/admin/stats | jq '.rateLimiter'

# Bulkhead queue depth
curl -s http://localhost:3000/admin/stats | jq '.bulkhead | {active: .activeCount, max: .maxConcurrent, queue: .queueLength}'
```

---

## 🚨 COMMON ISSUES & FIXES

| Issue                    | Cause             | Fix                                                                      |
| ------------------------ | ----------------- | ------------------------------------------------------------------------ |
| Port already in use      | Another process   | `kill -9 $(lsof -t -i :3000)`                                            |
| Service not found        | Service B down    | Start Service B                                                          |
| Rate limited immediately | Hit limit         | Reset: `curl -X POST http://localhost:3000/admin/rate-limiter/reset`     |
| Circuit always OPEN      | Service B offline | Bring Service B up                                                       |
| Bulkhead queue full      | Too many requests | Wait or reset: `curl -X POST http://localhost:3000/admin/bulkhead/reset` |

---

## 📊 RESPONSE EXAMPLES

### Success Response

```json
{
  "method": "with-all-protections",
  "success": true,
  "data": {
    "id": 456,
    "name": "Product 23",
    "price": 789
  },
  "protections": {
    "circuitBreaker": {
      "state": "CLOSED",
      "successRate": "94.11%"
    },
    "rateLimiter": {
      "remaining": 4
    },
    "bulkhead": {
      "active": 3
    }
  }
}
```

### Error Response (Rate Limited)

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded: 20 requests per 60 seconds",
  "retryAfter": 3500
}
```

### Error Response (Circuit Open)

```json
{
  "success": false,
  "error": "ServiceBCircuitBreaker Circuit Breaker is OPEN",
  "cbState": "OPEN",
  "cbStats": {
    "state": "OPEN",
    "failures": 8,
    "successRate": "38.46%"
  }
}
```

---

## 🎯 SCENARIO TEMPLATES

### Production Setup

```javascript
Retry: 5 attempts, 200ms initial, 2x backoff
Circuit Breaker: 30% threshold, 60s recovery
Rate Limiter: 1000 req/min
Bulkhead: 20 concurrent, 50 queue size
```

### API Gateway

```javascript
Retry: 3 attempts, 100ms initial, 2x backoff
Circuit Breaker: 50% threshold, 30s recovery
Rate Limiter: 100 req/min per user
Bulkhead: 5 concurrent, 20 queue size
```

### Microservice

```javascript
Retry: 2 attempts, 50ms initial, 2x backoff
Circuit Breaker: 25% threshold, 20s recovery
Rate Limiter: None (internal)
Bulkhead: 10 concurrent, 30 queue size
```

---

## 📚 USEFUL LINKS

- Diagram Flow: See `ARCHITECTURE.md`
- Full Setup: See `SETUP.md`
- Details: See `README.md`
- Summary: See `SUMMARY.md`

---

## ✨ Pro Tips

1. **Always use /with-all-protections in production**
2. **Monitor /admin/stats regularly**
3. **Adjust timeouts based on your network**
4. **Exponential backoff prevents thundering herd**
5. **Circuit breaker should be per dependency**
6. **Log all circuit breaker state changes**
7. **Test with Service B offline**
8. **Use 429 status code for rate limiting**

---

## 🧑‍💻 Code Reference

### Import in your code

```javascript
const RetryManager = require("./retryManager");
const CircuitBreakerManager = require("./circuitBreakerManager");
const { HttpClientRateLimiter } = require("./rateLimiterManager");
const BulkheadManager = require("./bulkheadManager");
```

### Use with async/await

```javascript
const result = await retryManager.executeWithRetry(async () => {
  return await axios.get(url);
}, "MyRequest");
```

### Chain multiple protections

```javascript
const result = await rateLimiter.executeWithRateLimit(async () => {
  return await bulkheadManager.execute(async () => {
    return await circuitBreakerManager.execute(async () => {
      return await retryManager.executeWithRetry(async () => {
        return await axios.get(url);
      });
    });
  });
});
```

---

**Last Updated: Feb 2, 2026**  
**Version: 1.0.0**

For detailed information, see the other documentation files.
