# KIẾN TRÚC & SƠ ĐỒ LUỒNG HOẠT ĐỘNG

## 📊 DIAGRAM 1: KIẾN TRÚC TỔNG THỂ

```
╔════════════════════════════════════════════════════════════════╗
║                       CLIENT / CONSUMER                        ║
║              (Browser / API Client / Postman)                  ║
╚═════════════════════════════╦══════════════════════════════════╝
                              │
                    HTTP Request (1)
                              │
                              ▼
╔════════════════════════════════════════════════════════════════╗
║              SERVICE A - API GATEWAY (Port 3000)              ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  Layer 1: EXPRESS MIDDLEWARE                            │ ║
║  │  - JSON parsing                                         │ ║
║  │  - Request logging                                      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                              │                                 ║
║                              ▼                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  Layer 2: RATE LIMITER                                  │ ║
║  │  - Check: requests/min < 20?                            │ ║
║  │  - YES → Continue                                       │ ║
║  │  - NO  → Return 429 (Too Many Requests)                 │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                              │                                 ║
║                              ▼                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  Layer 3: BULKHEAD PATTERN                              │ ║
║  │  - Check: activeCount < 5?                              │ ║
║  │  - YES → Execute immediately                            │ ║
║  │  - NO  → Add to queue (max 20)                           │ ║
║  │         Wait for slot to free up                        │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                              │                                 ║
║                              ▼                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  Layer 4: CIRCUIT BREAKER                               │ ║
║  │  - Check: Circuit state                                 │ ║
║  │  - CLOSED   → Send request                              │ ║
║  │  - OPEN     → Reject immediately (503)                  │ ║
║  │  - HALF_OPEN → Allow 1 test request                     │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                              │                                 ║
║                              ▼                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  Layer 5: RETRY MECHANISM                               │ ║
║  │  - Send HTTP request with timeout: 3000ms               │ ║
║  │  - Error? → shouldRetry()?                              │ ║
║  │    - YES → Wait (exponential backoff) → Retry            │ ║
║  │    - NO  → Throw error                                  │ ║
║  │  - Success → Return data                                │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                              │                                 ║
║                              ▼                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  HTTP CLIENT (Axios)                                    │ ║
║  │  - timeout: 3000ms                                      │ ║
║  │  - Send HTTP GET request                                │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                              │                                 ║
║                   HTTP Request (2)                            ║
╚════════════════════════════╦═════════════════════════════════╝
                             │
                             ▼
╔════════════════════════════════════════════════════════════════╗
║              SERVICE B - PROVIDER (Port 3001)                  ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  Processing:                                            │ ║
║  │  /api/data       → Return random product data           │ ║
║  │  /api/slow       → Wait X ms, then return data           │ ║
║  │  /api/error      → Return 500 error                      │ ║
║  │  /api/overload   → Check load, return 429 if full        │ ║
║  │  /api/health     → Return healthy status                 │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                              │                                 ║
║                   HTTP Response                               ║
╚════════════════════════════╦═════════════════════════════════╝
                             │
                             ▼
╔════════════════════════════════════════════════════════════════╗
║              SERVICE A - API GATEWAY (Port 3000)              ║
║                                                                ║
║  Response Processing:                                          ║
║  - Circuit Breaker: Record success/failure                    ║
║  - Bulkhead: Release slot                                     ║
║  - Format: JSON with protection stats                         ║
║                              │                                 ║
║                   HTTP Response                               ║
╚════════════════════════════╦═════════════════════════════════╝
                             │
                             ▼
╔════════════════════════════════════════════════════════════════╗
║                       CLIENT / CONSUMER                        ║
║              - Display data                                    ║
║              - Show response time                              ║
║              - Log success/error                               ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🔄 DIAGRAM 2: RETRY MECHANISM FLOW

```
┌─────────────────────────────────────────────────────────────┐
│  REQUEST START                                              │
│  - requestFn: Hàm HTTP request                              │
│  - maxRetries: 3                                            │
│  - currentAttempt: 0                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  Attempt < maxRetries?   │
        │  (0 < 3 = YES)           │
        └──────┬───────────────────┘
               │
        ┌──────▼──────┐
        │ Execute     │
        │ Request     │
        └──────┬──────┘
               │
               ▼
        ┌──────────────┐
        │ Success?     │
        └──┬───────┬───┘
         Y│       │N
          │       │
          │       ▼
          │  ┌────────────────────────────────┐
          │  │  shouldRetry(error)?           │
          │  │  - Check error type            │
          │  │  - Check status code           │
          │  │  - Check attempt count         │
          │  └────┬──────────────────────┬────┘
          │      Y│                      │N
          │       │                      │
          │       ▼                      ▼
          │  ┌──────────────────┐   ┌──────────┐
          │  │ Calculate Delay  │   │ Throw    │
          │  │                  │   │ Error    │
          │  │ delay = 100 × 2^n
          │  │ n=0: 100ms       │   └──────────┘
          │  │ n=1: 200ms       │
          │  │ n=2: 400ms       │
          │  │ (max 5000ms)     │
          │  └─────────┬────────┘
          │            │
          │            ▼
          │  ┌──────────────────┐
          │  │ Sleep(delay)     │
          │  │                  │
          │  │ [WAIT]           │
          │  └─────────┬────────┘
          │            │
          │            ▼
          │  ┌──────────────────┐
          │  │ Increment        │
          │  │ Attempt = 1      │
          │  └─────────┬────────┘
          │            │
          │            └───────────┐
          │                        │ (loop back)
          │                        ▼
          │              ┌──────────────────────┐
          │              │ Attempt < maxRetries?│
          │              │ (1 < 3 = YES)        │
          │              └──────────────────────┘
          │                        │
          │                    ┌───▼────┐
          │                    │ Execute│ (Attempt 2)
          │                    │Request │
          │                    └─────┬──┘
          │                          ▼
          │                    ┌──────────┐
          │                    │Success?  │ (YES)
          │                    └──┬───────┘
          │                       │
          └──────────────────┬────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ RETURN SUCCESS   │
                    │                  │
                    │ Retried: 1 times │
                    └──────────────────┘
```

---

## 🔌 DIAGRAM 3: CIRCUIT BREAKER STATE MACHINE

```
┌─────────────────────────────────────────────────────────────┐
│               CIRCUIT BREAKER STATES                        │
└─────────────────────────────────────────────────────────────┘

                        ┌────────────┐
                        │   CLOSED   │ (Default - Normal)
                        │            │
                        │ ✓ Requests │
                        │ ✓ Pass     │
                        │ ✓ through  │
                        └─────┬──────┘
                              │
                              │ (Error Rate > 50% OR Failures > 5)
                              ▼
                        ┌────────────┐
                        │    OPEN    │ (Circuit Broken)
                        │            │
                        │ ✗ All      │
                        │ ✗ requests │
                        │ ✗ rejected │
                        │ ✗ (503)    │
                        └─────┬──────┘
                              │
                              │ (After 30 seconds)
                              ▼
                        ┌────────────┐
                        │ HALF_OPEN  │ (Testing Recovery)
                        │            │
                        │ ⚠ Allow 1  │
                        │ ⚠ request  │
                        │ ⚠ to test  │
                        └────┬──┬────┘
                             │  │
            ┌────────────────┘  └──────────────────┐
            │                                       │
       SUCCESS                                   FAILURE
            │                                       │
            ▼                                       ▼
     ┌────────────┐                          ┌────────────┐
     │   CLOSED   │                          │    OPEN    │
     │            │                          │            │
     │(Recovered!)│                          │(Still bad) │
     └────────────┘                          └────────────┘


DETAILED STATE TRACKING:

CLOSED State:
├─ successCount = 0
├─ failureCount = 0
├─ timeoutCount = 0
├─ request incoming
│  └─ if success: successCount++
│  └─ if failure: failureCount++, check threshold
└─ if failureRate > 50% → OPEN

OPEN State:
├─ timestamp = now (time circuit opened)
├─ all incoming requests rejected immediately (503)
├─ no HTTP calls made
└─ after 30s timeout → HALF_OPEN

HALF_OPEN State:
├─ allow next request to test service
├─ if success
│  └─ reset stats → CLOSED
│  └─ resume normal operation
└─ if failure
   └─ reset timeout → OPEN
   └─ stay broken longer
```

---

## 📊 DIAGRAM 4: RATE LIMITER TIMELINE

```
Request Timeline over 60 seconds:

Time 0s:    Request 1 ✓ (Count: 1/20)
Time 0.1s:  Request 2 ✓ (Count: 2/20)
Time 0.2s:  Request 3 ✓ (Count: 3/20)
...
Time 2s:    Request 20 ✓ (Count: 20/20) [LIMIT REACHED]
Time 2.1s:  Request 21 ✗ (RATE LIMITED - 429)
Time 2.2s:  Request 22 ✗ (RATE LIMITED - 429)
...
Time 60s:   Window slides
            Request 1 removed from window
            Available slots: 1
            Request 21 ✓ (can now succeed)


Window-based Algorithm:
═════════════════════════════════════════════════════════════

│← 60 second window →│
│                    │
├─ Request 1 (0s)   │
├─ Request 2 (0.1s) │
├─ Request 3 (0.2s) │
...
├─ Request 20 (2s)  │
│                    │
└─ Request 21 (60s) ← REJECTED (exceeds 20)

At time 61s:
│← 60 second window →│
  ↓                  ↓
│ Request 2 (0.1s) │← Request 1 expired
│ Request 3 (0.2s) │
...
│ Request 20 (2s)  │
│ Request 21 (60s) │
│ Request 22 (60.1)│
│ Request 23 (60.2)│
│
└─ New Request ✓ (1st slot available)

```

---

## 🔒 DIAGRAM 5: BULKHEAD QUEUEING SYSTEM

```
                    BULKHEAD MANAGER
            (Max Concurrent: 5, Max Queue: 20)


INITIAL STATE (Empty):
┌───────────────────────────────────────┐
│ ACTIVE SLOTS (0/5):                   │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │    │ │    │ │    │ │    │ │    │   │
│ └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                       │
│ QUEUE (0/20):                         │
│ ────────────────────────────────────  │
└───────────────────────────────────────┘


10 REQUESTS ARRIVE IMMEDIATELY:
┌───────────────────────────────────────┐
│ ACTIVE SLOTS (5/5):                   │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │ R1 │ │ R2 │ │ R3 │ │ R4 │ │ R5 │   │
│ └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                       │
│ QUEUE (5/20):                         │
│ ├─ R6  (waiting 1.2s)                 │
│ ├─ R7  (waiting 1.0s)                 │
│ ├─ R8  (waiting 0.8s)                 │
│ ├─ R9  (waiting 0.5s)                 │
│ └─ R10 (waiting 0.1s)                 │
└───────────────────────────────────────┘


REQUEST R1 COMPLETES (after 1.5s):
┌───────────────────────────────────────┐
│ ACTIVE SLOTS (4/5):                   │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │    │ │ R2 │ │ R3 │ │ R4 │ │ R5 │   │
│ └────┘ └────┘ └────┘ └────┘ └────┘   │
│    ↑ (slot freed)                     │
│    │                                   │
│ QUEUE (4/20):                         │
│ ├─ R7  (moved to ACTIVE slot 1)       │
│ ├─ R8  (waiting)                      │
│ ├─ R9  (waiting)                      │
│ └─ R10 (waiting)                      │
└───────────────────────────────────────┘


TIMELINE:
═════════════════════════════════════════════════════════════

Time 0ms:    R1-R5 start immediately (fill 5 slots)
             R6-R10 queue waiting

Time 1500ms: R1 finishes
             R6 moves to active
             Other slots still processing

Time 2000ms: R2 finishes
             R7 moves to active
             Still waiting: R8, R9, R10

Time 2500ms: R3 finishes
             R8 moves to active

Time 3000ms: R4 finishes
             R9 moves to active

Time 3500ms: R5 finishes
             R10 moves to active

Time 5000ms: All completed ✓

```

---

## 🏗️ DIAGRAM 6: COMPLETE REQUEST FLOW WITH ALL PROTECTIONS

```
                    CLIENT REQUEST
                          │
                          ▼
        ╔═══════════════════════════════════════╗
        ║   SERVICE A - API GATEWAY             ║
        ╠═══════════════════════════════════════╣
        │                                       │
        │  [1] REQUEST ARRIVES                 │
        │      → Parse JSON                    │
        │      → Generate requestId (UUID)     │
        │      → Start timer                   │
        │                                       │
        │      ┌──────────────────────────┐    │
        │      │ REQUEST ID: abc123       │    │
        │      │ TIME: 2024-02-02T10:30   │    │
        │      └──────────────────────────┘    │
        │                                       │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [2] RATE LIMITER CHECK               ║
        ║      Max: 20 requests/60s             ║
        ╠═══════════════════════════════════════╣
        │ Active: 15 requests                   │
        │ Limit:  20 requests                   │
        │ Result: ✓ ALLOWED (15 < 20)          │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [3] BULKHEAD CHECK                   ║
        ║      Max Concurrent: 5                ║
        ╠═══════════════════════════════════════╣
        │ Active slots: 3/5                     │
        │ Queue size:   0/20                    │
        │ Result: ✓ EXECUTE (3 < 5)            │
        │ Active slots: 4/5                     │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [4] CIRCUIT BREAKER STATE CHECK      ║
        ║      Current State: CLOSED            ║
        ╠═══════════════════════════════════════╣
        │ Successes: 45                         │
        │ Failures:  3                          │
        │ Success Rate: 93.75%                  │
        │ State: CLOSED                         │
        │ Result: ✓ PROCEED (state is CLOSED) │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [5] RETRY WRAPPER SETUP              ║
        ║      Max Attempts: 3                  ║
        ║      Initial Delay: 100ms             ║
        ║      Backoff Multiplier: 2            ║
        ╠═══════════════════════════════════════╣
        │ Attempt 1/3                           │
        │   ↓                                   │
        │   Send HTTP GET /api/data             │
        │   to Service B (http://localhost:3001)
        │   Timeout: 3000ms                     │
        │                                       │
        │   Response: 200 OK                    │
        │   Data: {id:456, name:Product 23...} │
        │   ✓ SUCCESS! (No retry needed)       │
        │                                       │
        │ Record in Circuit Breaker:            │
        │   ✓ 1 success                         │
        │   Success rate: 94.11%                │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [6] RESPONSE FORMATTING              ║
        ║  Release Bulkhead Slot (4 → 3)        ║
        ╠═══════════════════════════════════════╣
        │ {                                     │
        │   "method": "with-all-protections",  │
        │   "success": true,                    │
        │   "data": {...},                      │
        │   "protections": {                    │
        │     "retry": {                        │
        │       "maxRetries": 3,                │
        │       "attempts": 1                   │
        │     },                                │
        │     "circuitBreaker": {               │
        │       "state": "CLOSED",              │
        │       "successes": 46,                │
        │       "successRate": "94.11%"         │
        │     },                                │
        │     "rateLimiter": {                  │
        │       "remaining": 4                  │
        │     },                                │
        │     "bulkhead": {                     │
        │       "active": 3,                    │
        │       "available": 2                  │
        │     }                                 │
        │   }                                   │
        │ }                                     │
        └────────────────┬────────────────────┘
                         │
                         ▼
                    CLIENT RESPONSE
                   (Status: 200 OK)
```

---

## ⏱️ DIAGRAM 7: FAILURE SCENARIO FLOW

```
                    CLIENT REQUEST
                          │
                          ▼
        [SERVICE B DOWN - Network Error]
                          │
                          ▼
        ╔═══════════════════════════════════════╗
        ║  [1-3] Rate Limiter, Bulkhead OK      ║
        ╠═══════════════════════════════════════╣
        │ Result: ✓ PASS                        │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [4] CIRCUIT BREAKER STATE CHECK      ║
        ║      Current State: CLOSED            ║
        ╠═══════════════════════════════════════╣
        │ Result: ✓ PROCEED (state is CLOSED)  │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [5] RETRY ATTEMPT 1/3                ║
        ║      Send HTTP request                ║
        ╠═══════════════════════════════════════╣
        │ → GET http://localhost:3001/api/data │
        │ ✗ ECONNREFUSED (Connection refused)  │
        │   Delay: 100ms                        │
        │   shouldRetry? YES                    │
        └────────────────┬────────────────────┘
                         │
                    [WAIT 100ms]
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [5] RETRY ATTEMPT 2/3                ║
        ║      Send HTTP request                ║
        ╠═══════════════════════════════════════╣
        │ → GET http://localhost:3001/api/data │
        │ ✗ ECONNREFUSED (Connection refused)  │
        │   Delay: 200ms (exponential backoff) │
        │   shouldRetry? YES                    │
        └────────────────┬────────────────────┘
                         │
                    [WAIT 200ms]
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [5] RETRY ATTEMPT 3/3 (FINAL)        ║
        ║      Send HTTP request                ║
        ╠═══════════════════════════════════════╣
        │ → GET http://localhost:3001/api/data │
        │ ✗ ECONNREFUSED (Connection refused)  │
        │   Delay: 400ms (exponential backoff) │
        │   shouldRetry? NO (max retries reached)
        │   ✗ THROW ERROR                       │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [4] CIRCUIT BREAKER UPDATE           ║
        ║      Record failure                   ║
        ╠═══════════════════════════════════════╣
        │ Successes:  45                        │
        │ Failures:   4  ← incremented          │
        │ Error Rate: (4/49) = 8.16% (not >50%) │
        │ State: CLOSED (stays closed)          │
        │                                       │
        │ (But after 5+ failures, would open)   │
        └────────────────┬────────────────────┘
                         │
                         ▼
        ╔═══════════════════════════════════════╗
        ║  [6] ERROR RESPONSE                   ║
        ║  Release Bulkhead Slot                ║
        ╠═══════════════════════════════════════╣
        │ {                                     │
        │   "method": "with-all-protections",  │
        │   "success": false,                   │
        │   "error": "ECONNREFUSED",            │
        │   "protections": {                    │
        │     "circuitBreaker": {               │
        │       "state": "CLOSED",              │
        │       "failures": 4,                  │
        │       "successRate": "91.84%"         │
        │     }                                 │
        │   }                                   │
        │ }                                     │
        └────────────────┬────────────────────┘
                         │
                         ▼
           CLIENT RESPONSE (Status: 503)


CIRCUIT BREAKER OPENS (After 5+ consecutive failures):
═════════════════════════════════════════════════════════════

Request 6:
        ┌──────────────────────────────────┐
        │ [5] RETRY ATTEMPT 1/3            │
        │ ✗ ECONNREFUSED                   │
        │ Failures: 5                       │
        │ Error Rate: (5/50) = 10%  > 50%? │
        │ → Recalculate: last 10 requests? │
        │   All failed → Error Rate: 100%! │
        │ ✓ TRIGGER CIRCUIT OPEN           │
        │ Status → OPEN                    │
        └──────────────────────────────────┘

Request 7 (with OPEN circuit):
        ┌──────────────────────────────────┐
        │ [4] CIRCUIT BREAKER STATE CHECK  │
        │ State: OPEN                       │
        │ ✗ REJECT immediately (no retry)  │
        │ Status: 503 Service Unavailable  │
        │                                  │
        │ No HTTP call made!                │
        │ Fast fail (< 1ms vs 10s timeout) │
        └──────────────────────────────────┘

After 30 seconds (resetTimeout):
        ┌──────────────────────────────────┐
        │ [4] CIRCUIT BREAKER STATE CHECK  │
        │ State: OPEN → HALF_OPEN          │
        │ Allow next request to test       │
        │                                  │
        │ If Service B is back up:         │
        │ Request succeeds → CLOSED        │
        │ Request fails → OPEN again       │
        └──────────────────────────────────┘
```

---

## 📈 PERFORMANCE COMPARISON

```
SCENARIO: Service B responds in 100ms normally, 500ms when slow

WITHOUT PROTECTIONS:
────────────────────────────
Normal Request:     100ms   ✓
Slow Request:       500ms   ✗
Timeout (3s):       3000ms  ✗
Service Down:       3000ms  ✗ (waste time)
Cascading Failures: ∞ (destroy system)


WITH RETRY ONLY:
────────────────────────────
Normal Request:     100ms      ✓
Slow Request:       500ms      ✗ (same)
Timeout + Retry:    3000ms + exponential backoff
Service Down:       3000ms × 3 = 9000ms (worse!)


WITH CIRCUIT BREAKER ONLY:
────────────────────────────
Normal Request:     100ms      ✓
Service Down (1st): 3000ms     ✗ (wait timeout)
Service Down (5+):  < 1ms      ✓ (fast fail!)
Prevents Cascades:  ✓


WITH RATE LIMITER ONLY:
────────────────────────────
Normal Requests:    100ms      ✓
Over Limit:         < 1ms      ✓ (reject immediately)
But slow services still affect system...


WITH BULKHEAD ONLY:
────────────────────────────
Prevents Pool Exhaustion: ✓
But doesn't prevent cascade...


WITH ALL COMBINED:
────────────────────────────
Normal Request:         100ms       ✓
Slow Request (retry):   500-2000ms  ✓ (recovers)
Service Down (circuit): < 1ms       ✓ (fast fail)
Rate Limited:           < 1ms       ✓ (immediate)
System Stability:       ✓✓✓ (Best!)
```

---

End of diagrams. These help visualize how each protection works and how they interact together.
