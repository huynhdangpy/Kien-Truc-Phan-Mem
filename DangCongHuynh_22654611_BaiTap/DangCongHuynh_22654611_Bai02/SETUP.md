# HƯỚNG DẪN CHẠY HỆ THỐNG FAULT TOLERANCE

## 🚀 BƯỚC 1: CHUẨN BỊ MÔI TRƯỜNG

### Kiểm Tra Node.js

```bash
node --version    # Cần v16 hoặc cao hơn
npm --version
```

### Clone / Chuẩn Bị Folder

```
DangCongHuynh_22654611_Bai02/
├── service-a/          # API Gateway
│   ├── server.js
│   ├── retryManager.js
│   ├── circuitBreakerManager.js
│   ├── rateLimiterManager.js
│   ├── bulkheadManager.js
│   ├── test-scenarios.js
│   └── package.json
│
├── service-b/          # Provider
│   ├── server.js
│   └── package.json
│
└── README.md           # Documentation
```

---

## 📥 BƯỚC 2: CÀI ĐẶT DEPENDENCIES

### Service B (Terminal 1)

```bash
cd service-b
npm install
```

**Output mong đợi:**

```
added 58 packages in 5s
```

### Service A (Terminal 2)

```bash
cd service-a
npm install
```

**Output mong đợi:**

```
added 145 packages in 8s
```

---

## ▶️ BƯỚC 3: KHỞI ĐỘNG SERVICES

### Khởi động Service B (Provider)

**Terminal 1:**

```bash
cd service-b
npm start
```

**Output mong đợi:**

```
╔════════════════════════════════════════╗
║       SERVICE B - PROVIDER (Bắt đầu)   ║
╚════════════════════════════════════════╝
📡 Server đang chạy tại: http://localhost:3001
🔗 Endpoints:
   ✓ GET  /api/health              - Kiểm tra trạng thái
   ✓ GET  /api/data                - Dữ liệu bình thường
   ✓ GET  /api/slow?delay=5000     - Phản hồi chậm (timeout)
   ✓ GET  /api/error?rate=100      - Trả về lỗi
   ✓ GET  /api/overload            - Mô phỏng quá tải

🔧 Admin Endpoints:
   ✓ POST /admin/health/:status    - Thay đổi trạng thái
   ✓ POST /admin/reset             - Reset counter
   ✓ GET  /admin/stats             - Lấy thống kê

📝 Ấn Ctrl+C để dừng server
```

### Khởi động Service A (API Gateway)

**Terminal 2:**

```bash
cd service-a
npm start
```

**Output mong đợi:**

```
╔════════════════════════════════════════════════════════╗
║       SERVICE A - API GATEWAY (Đã bắt đầu)             ║
╚════════════════════════════════════════════════════════╝
📡 Server đang chạy tại: http://localhost:3000
🔗 Service B URL: http://localhost:3001

📚 API ENDPOINTS:
   1️⃣ GET /api/health                 - Health check
   2️⃣ GET /api/no-protection          - Baseline
   3️⃣ GET /api/with-retry             - Với Retry
   4️⃣ GET /api/with-circuit-breaker   - Với Circuit Breaker
   5️⃣ GET /api/with-rate-limiter      - Với Rate Limiter
   6️⃣ GET /api/with-bulkhead          - Với Bulkhead
   7️⃣ GET /api/with-all-protections   - Với TẤT CẢ protections

🔧 ADMIN ENDPOINTS:
   ✓ GET  /admin/stats
   ✓ POST /admin/circuit-breaker/reset
   ✓ POST /admin/rate-limiter/reset
   ✓ POST /admin/bulkhead/reset

📝 Ấn Ctrl+C để dừng server
```

✅ **Cả hai services đã chạy!**

---

## 🧪 BƯỚC 4: CHẠY TEST SCENARIOS

**Terminal 3:**

```bash
cd service-a
npm test
```

**Output mong đợi:**

```
╔════════════════════════════════════════════════════════╗
║       FAULT TOLERANCE TEST SCENARIOS                   ║
╚════════════════════════════════════════════════════════╝

Checking if services are running...
✓ Service A is running at http://localhost:3000
✓ Service B is running at http://localhost:3001

╔ KỊCH BẢN 1: Service B Chậm (Timeout) ╚

Mô phỏng: Service B phản hồi chậm
Kỳ vọng:
  - No Protection: Timeout hoặc chờ lâu
  - With Retry: Retry và có thể thành công
  - With All Protections: Circuit Breaker ngắn timeout

→ Resetting Service B stats...
→ Calling Service B /api/slow endpoint (5 seconds delay)...

  [TEST 1] Without Protection:
✗ Timeout sau 2000ms

  [TEST 2] With Retry (timeout: 1s, max 3 retries):
✓ Success: 200 (1234ms)

[Tiếp tục các kịch bản khác...]
```

Script sẽ tự động chạy 6 kịch bản:

1. ✅ Service B chậm (timeout)
2. ✅ Service B lỗi (5xx)
3. ✅ Rate limiting
4. ✅ Concurrent requests (bulkhead)
5. ✅ Service down (circuit breaker)
6. ✅ Complete test (all protections)

---

## 🔬 BƯỚC 5: TEST THỦ CÔNG (MANUAL)

### Test 1: Health Check

```bash
curl http://localhost:3000/api/health

# Response:
{
  "status": "healthy",
  "service": "Service A - API Gateway",
  "timestamp": "2024-02-02T10:30:00.000Z"
}
```

### Test 2: Request mà không có Protection (Baseline)

```bash
curl http://localhost:3000/api/no-protection

# Success Response:
{
  "method": "no-protection",
  "success": true,
  "data": {
    "id": 456,
    "name": "Product 23",
    "price": 789,
    "timestamp": "2024-02-02T10:30:00.000Z"
  },
  "requestId": "abc123..."
}
```

### Test 3: Request với Retry

```bash
curl http://localhost:3000/api/with-retry

# Response (sau ~2 lần retry):
{
  "method": "with-retry",
  "success": true,
  "data": {...},
  "requestId": "abc123..."
}
```

### Test 4: Request với Circuit Breaker

```bash
curl http://localhost:3000/api/with-circuit-breaker

# Response when CLOSED (normal):
{
  "method": "with-circuit-breaker",
  "success": true,
  "cbState": "CLOSED",
  "cbStats": {
    "state": "CLOSED",
    "successes": 10,
    "failures": 0,
    "successRate": "100%"
  }
}

# Response when OPEN (service down):
{
  "method": "with-circuit-breaker",
  "success": false,
  "error": "ServiceBCircuitBreaker Circuit Breaker is OPEN",
  "cbState": "OPEN",
  "cbStats": {
    "state": "OPEN",
    "successes": 5,
    "failures": 8,
    "successRate": "38.46%"
  }
}
```

### Test 5: Request với Rate Limiter

```bash
# Request 1-20: Success
curl http://localhost:3000/api/with-rate-limiter
# Status: 200

# Request 21+: Rate Limited
curl http://localhost:3000/api/with-rate-limiter
# Status: 429
# {
#   "error": "Too Many Requests",
#   "message": "Rate limit exceeded: 20 requests per 60 seconds"
# }
```

### Test 6: Request với Bulkhead

```bash
# Gửi multiple concurrent requests
for i in {1..10}; do
  curl http://localhost:3000/api/with-bulkhead &
done
wait

# Monitor active requests:
curl http://localhost:3000/admin/stats | jq '.bulkhead'
```

### Test 7: Request với TẤT CẢ Protections ⭐

```bash
curl http://localhost:3000/api/with-all-protections

# Response:
{
  "method": "with-all-protections",
  "success": true,
  "data": {...},
  "protections": {
    "retry": {
      "maxRetries": 3
    },
    "circuitBreaker": {
      "state": "CLOSED",
      "successes": 45,
      "failures": 3,
      "successRate": "93.75%"
    },
    "rateLimiter": {
      "maxRequests": 20,
      "windowMs": 60000,
      "activeRequests": 2,
      "utilization": "10.00%"
    },
    "bulkhead": {
      "maxConcurrent": 5,
      "activeCount": 1,
      "availableSlots": 4,
      "utilization": "20.00%"
    }
  }
}
```

---

## 📊 BƯỚC 6: MONITORING - XEM THỐNG KÊ

### Xem tất cả thống kê

```bash
curl http://localhost:3000/admin/stats | jq
```

### Reset Circuit Breaker

```bash
curl -X POST http://localhost:3000/admin/circuit-breaker/reset
```

### Reset Rate Limiter

```bash
curl -X POST http://localhost:3000/admin/rate-limiter/reset
```

### Reset Bulkhead

```bash
curl -X POST http://localhost:3000/admin/bulkhead/reset
```

### Control Service B Health

```bash
# Bring Service B down
curl -X POST http://localhost:3001/admin/health/down

# Bring Service B up
curl -X POST http://localhost:3001/admin/health/up
```

---

## 🎯 KỊCH BẢN TEST KHUYẾN KHÍCH

### Kịch Bản 1: Mô Phỏng Timeout

**Terminal 3:**

```bash
# Reset Service B
curl -X POST http://localhost:3001/admin/reset

# Gửi request tới service chậm
curl "http://localhost:3000/api/with-retry"

# Xem logs ở Terminal 2 (Service A) để thấy retry attempts
```

**Kỳ vọng xem ở logs:**

```
[RETRY] Request - Attempt 1/4
[RETRY] Request - Attempt 2/4
[RETRY] Request - Attempt 3/4
[RETRY] Request - Thành công sau 2 lần retry
```

---

### Kịch Bản 2: Trigger Circuit Breaker

**Terminal 3:**

```bash
# Gửi 10 requests liên tiếp tới service có lỗi
for i in {1..10}; do
  curl http://localhost:3000/api/with-circuit-breaker
  sleep 0.2
done

# Xem logs để thấy circuit breaker state thay đổi
```

**Kỳ vọng xem ở logs:**

```
[CIRCUIT-BREAKER] Request 1-5: Failures
[CIRCUIT-BREAKER] State changed to OPEN
[CIRCUIT-BREAKER] Request 6-10: Fast fail (Circuit OPEN)
```

---

### Kịch Bản 3: Test Rate Limiting

**Terminal 3:**

```bash
# Gửi 30 requests nhanh (mỗi cái delay 0.1s)
for i in {1..30}; do
  curl http://localhost:3000/api/with-rate-limiter -w "\nStatus: %{http_code}\n"
  sleep 0.1
done
```

**Kỳ vọng:**

- Requests 1-20: Status 200 ✅
- Requests 21-30: Status 429 ⚠️

---

### Kịch Bản 4: Test Bulkhead với Load

**Terminal 3:**

```bash
# Gửi 15 concurrent requests
for i in {1..15}; do
  curl http://localhost:3000/api/with-bulkhead &
done
wait

# Check stats
curl http://localhost:3000/admin/stats | jq '.bulkhead'
```

**Kỳ vọng:**

```
{
  "activeCount": 0,           # Hoàn thành
  "maxConcurrent": 5,
  "queueLength": 0,           # Queue trống
  "utilization": "0.00%"
}
```

---

### Kịch Bản 5: Service Down Scenario

**Terminal 3:**

```bash
# Step 1: Bring service down
curl -X POST http://localhost:3001/admin/health/down

# Step 2: Send requests (circuit should open)
for i in {1..8}; do
  curl http://localhost:3000/api/with-circuit-breaker -s | jq '.cbState'
  sleep 0.5
done

# Step 3: Bring service back up
curl -X POST http://localhost:3001/admin/health/up

# Step 4: Wait 30 seconds (reset timeout)
sleep 30

# Step 5: Send requests (circuit should be testing recovery)
curl http://localhost:3000/api/with-circuit-breaker | jq '.cbState'
```

**Kỳ vọng:**

```
Initial: CLOSED
After failures: OPEN
After service up + 30s: HALF_OPEN
After success: CLOSED
```

---

## 📝 CÁCH XEM LOGS

### Terminal 1 (Service B) - Provider Logs

```
[SERVICE-B] Health check request
[SERVICE-B] Data request (requestCount: 1)
[SERVICE-B] Slow response request (delay: 5000ms)
```

### Terminal 2 (Service A) - API Gateway Logs

```
[SERVICE-A] With Retry - Start
[RETRY] Request - Attempt 1/4
[RETRY] Request - Attempt 2/4 - Exponential backoff delay: 200ms
[RETRY] Request - Thành công sau 1 lần retry

[CIRCUIT-BREAKER] Request - Executing request
[CIRCUIT-BREAKER] State changed to OPEN
[CIRCUIT-BREAKER] Circuit is OPEN, request rejected

[RATE-LIMITER] Request allowed (remainingRequests: 18)
[RATE-LIMITER] Rate limit reached (waitTime: 3500ms)

[BULKHEAD] Request executing
[BULKHEAD] Request completed (activeCount: 1)
```

---

## ✅ VALIDATION CHECKLIST

Sau khi chạy xong, kiểm tra các điểm sau:

- [ ] Service B chạy ở port 3001
- [ ] Service A chạy ở port 3000
- [ ] Health check endpoints trả về 200
- [ ] Retry logic tự động thử lại khi lỗi
- [ ] Circuit Breaker state thay đổi từ CLOSED → OPEN → HALF_OPEN
- [ ] Rate Limiter reject requests khi vượt quá 20/minute
- [ ] Bulkhead hold max 5 concurrent requests
- [ ] All protections kết hợp hoạt động đúng
- [ ] Logs in Terminal 1 & 2 show các operations

---

## 🐛 TROUBLESHOOTING

### Q: Port 3000/3001 already in use?

```bash
# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Q: Can't install npm packages?

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Q: Services not communicating?

```bash
# Check Service B is healthy
curl http://localhost:3001/api/health

# Check Service A can see Service B
curl http://localhost:3000/api/health

# Look at error logs in terminals
```

### Q: Tests failing?

```bash
# Restart both services
# Press Ctrl+C in both terminals

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start again
npm start
```

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Kiểm tra Node.js version >= 16
2. Kiểm tra cả 2 services đang chạy
3. Xem logs ở terminals
4. Restart services
5. Reset all protections: `/admin/*reset`

---

**Created:** Feb 2, 2026
**Author:** Đặng Công Huyền (22654611)
