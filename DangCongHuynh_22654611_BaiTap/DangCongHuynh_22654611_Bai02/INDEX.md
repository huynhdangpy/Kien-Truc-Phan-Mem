# 📑 INDEX - BÀI 2: FAULT TOLERANCE MICROSERVICES

## 📂 Cấu Trúc Project

```
DangCongHuynh_22654611_Bai02/
│
├─ 📄 QUICK_REFERENCE.md         [START HERE! 👈]
│                                 • Cheat sheet & quick commands
│                                 • Fast API testing
│                                 • Common issues & fixes
│
├─ 📄 SETUP.md                   [HOW TO RUN]
│                                 • Step-by-step installation
│                                 • Start all services
│                                 • Run test scenarios
│                                 • Manual testing guide
│
├─ 📄 README.md                  [DETAILED DOCS]
│                                 • Full API reference
│                                 • All 4 fault tolerance techniques
│                                 • 6 test scenarios
│                                 • Best practices
│
├─ 📄 ARCHITECTURE.md            [DIAGRAMS & FLOWS]
│                                 • System architecture diagram
│                                 • Retry mechanism flow
│                                 • Circuit breaker state machine
│                                 • Rate limiter timeline
│                                 • Bulkhead queueing
│                                 • Complete request flow
│                                 • Failure scenarios
│
├─ 📄 SUMMARY.md                 [OVERVIEW]
│                                 • Project summary
│                                 • Key takeaways
│                                 • Performance comparison
│                                 • Real-world applications
│
└─ 📂 Code Files:
   ├─ service-a/                 [API Gateway - Port 3000]
   │  ├─ server.js               (400 lines) - Main server + 7 endpoints
   │  ├─ retryManager.js         (120 lines) - Retry with exponential backoff
   │  ├─ circuitBreakerManager.js (140 lines) - Circuit breaker (Opossum)
   │  ├─ rateLimiterManager.js   (160 lines) - Rate limiting
   │  ├─ bulkheadManager.js      (180 lines) - Bulkhead pattern
   │  ├─ test-scenarios.js       (400 lines) - 6 automated test scenarios
   │  └─ package.json
   │
   └─ service-b/                 [Provider - Port 3001]
      ├─ server.js               (250 lines) - Mock provider + 5 endpoints
      └─ package.json
```

---

## 🎯 HOW TO USE THIS PROJECT

### For Beginners

1. **Read First:** `QUICK_REFERENCE.md` (5 min)
2. **Setup:** `SETUP.md` section "Bước 1-3" (10 min)
3. **Run Tests:** Run `npm test` (5 min)
4. **Try APIs:** Test endpoints using curl (5 min)

### For Learning

1. **Understand:** Read `README.md` (20 min)
2. **Visualize:** Study `ARCHITECTURE.md` diagrams (15 min)
3. **Experiment:** Modify config in code, test changes (20 min)
4. **Deep Dive:** Read individual manager files (30 min)

### For Implementation

1. **Study:** `ARCHITECTURE.md` - understand patterns
2. **Copy:** Use managers from `service-a/` in your project
3. **Customize:** Adjust config for your use case
4. **Deploy:** Use in production with proper monitoring

---

## 📚 FILE DESCRIPTIONS

### Documentation Files

#### QUICK_REFERENCE.md [⭐ START HERE]

- **Length:** 1 page
- **Time to read:** 5 minutes
- **Content:**
  - Quick startup commands
  - API call examples
  - Each technique summary
  - Common issues & fixes
  - Pro tips

**Read when:** You want quick answers

---

#### SETUP.md [HOW TO RUN]

- **Length:** 6 pages
- **Time to read:** 15 minutes
- **Content:**
  - Environment setup
  - Installation steps
  - Starting services
  - Manual testing examples
  - Validation checklist
  - Troubleshooting

**Read when:** Setting up the project for the first time

---

#### README.md [COMPLETE GUIDE]

- **Length:** 12 pages
- **Time to read:** 40 minutes
- **Content:**
  - System architecture
  - Detailed explanation of 4 techniques
  - All test scenarios (1-6)
  - API reference
  - Monitoring endpoints
  - Best practices
  - Troubleshooting

**Read when:** You want comprehensive understanding

---

#### ARCHITECTURE.md [DIAGRAMS]

- **Length:** 8 pages
- **Time to read:** 30 minutes
- **Content:**
  - System architecture diagram
  - Retry mechanism flowchart
  - Circuit breaker state machine
  - Rate limiter timeline
  - Bulkhead queue system
  - Complete request flow
  - Failure scenarios
  - Performance comparison

**Read when:** You want visual understanding of flows

---

#### SUMMARY.md [OVERVIEW]

- **Length:** 4 pages
- **Time to read:** 10 minutes
- **Content:**
  - Project summary
  - File structure
  - Quick start
  - Key techniques
  - Test scenarios overview
  - Real-world applications
  - Validation checklist

**Read when:** You want high-level overview

---

### Code Files

#### Service A - API Gateway (Port 3000)

**server.js** [400 lines]

- Main Express server
- 7 API endpoints:
  1. `/api/health` - Health check
  2. `/api/no-protection` - Baseline (no protection)
  3. `/api/with-retry` - With Retry
  4. `/api/with-circuit-breaker` - With Circuit Breaker
  5. `/api/with-rate-limiter` - With Rate Limiter
  6. `/api/with-bulkhead` - With Bulkhead
  7. `/api/with-all-protections` - All combined ⭐
- Admin endpoints for monitoring

**retryManager.js** [120 lines]

- Retry logic with exponential backoff
- Configurable: maxRetries, initialDelay, backoffMultiplier
- Handles network errors and HTTP 5xx responses

**circuitBreakerManager.js** [140 lines]

- Opossum-based circuit breaker
- States: CLOSED → OPEN → HALF_OPEN → CLOSED
- Auto-recovery mechanism

**rateLimiterManager.js** [160 lines]

- HTTP client rate limiter (for Service A → B calls)
- Window-based throttling
- Configurable: maxRequests, windowMs

**bulkheadManager.js** [180 lines]

- Queue-based bulkhead pattern
- Limits concurrent requests
- Auto-queuing when slots full

**test-scenarios.js** [400 lines]

- 6 automated test scenarios:
  1. Slow service (timeout)
  2. Service errors (5xx)
  3. Rate limiting
  4. Concurrent load (bulkhead)
  5. Service down (circuit breaker)
  6. Complete test (all protections)
- Beautiful colored output

**package.json**

- Dependencies: express, axios, opossum, express-rate-limit, pino

---

#### Service B - Provider (Port 3001)

**server.js** [250 lines]

- Mock provider service
- 5 endpoints:
  1. `/api/health` - Health check
  2. `/api/data` - Normal response
  3. `/api/slow` - Slow response (timeout test)
  4. `/api/error` - Error response
  5. `/api/overload` - Overload simulation
- Admin endpoints:
  - `/admin/health/up|down` - Control service
  - `/admin/reset` - Reset counter
  - `/admin/stats` - Get stats

**package.json**

- Dependencies: express, pino

---

## 🚀 QUICK START (3 STEPS)

### Step 1: Install & Start Service B

```bash
cd service-b
npm install
npm start  # Port 3001
```

### Step 2: Install & Start Service A (new terminal)

```bash
cd service-a
npm install
npm start  # Port 3000
```

### Step 3: Run Tests (new terminal)

```bash
cd service-a
npm test   # Runs 6 scenarios
```

✅ Done! All tests should pass.

---

## 🔍 DOCUMENTATION READING PATH

```
Beginner Path (30 min):
└─ QUICK_REFERENCE.md (5 min)
   └─ SETUP.md Bước 1-4 (10 min)
   └─ Run tests & try APIs (15 min)

Learning Path (90 min):
└─ QUICK_REFERENCE.md (5 min)
   └─ SETUP.md (15 min)
   └─ README.md (40 min)
   └─ ARCHITECTURE.md key sections (20 min)
   └─ Explore code files (10 min)

Deep Learning Path (3+ hours):
└─ All documentation (90 min)
   └─ Read all code files (60 min)
   └─ Experiment & modify (30+ min)
   └─ Deploy to own project (30+ min)
```

---

## 📋 FILE PURPOSES MATRIX

| File                     | Purpose         | Read When               | Time   |
| ------------------------ | --------------- | ----------------------- | ------ |
| QUICK_REFERENCE.md       | Cheat sheet     | Quick lookup            | 5 min  |
| SETUP.md                 | How to run      | First time setup        | 15 min |
| README.md                | Complete guide  | Learn details           | 40 min |
| ARCHITECTURE.md          | Visual flows    | Understand architecture | 30 min |
| SUMMARY.md               | Overview        | Get summary             | 10 min |
| server.js (A)            | Main code       | Implement               | Varies |
| retryManager.js          | Retry logic     | Learn pattern           | 15 min |
| circuitBreakerManager.js | Circuit breaker | Learn pattern           | 15 min |
| rateLimiterManager.js    | Rate limiting   | Learn pattern           | 15 min |
| bulkheadManager.js       | Bulkhead        | Learn pattern           | 15 min |
| test-scenarios.js        | Tests           | Run & learn             | 15 min |
| server.js (B)            | Mock provider   | Understand testing      | 10 min |

---

## ⭐ KEY FEATURES

- ✅ **4 Fault Tolerance Techniques:** Retry, Circuit Breaker, Rate Limiter, Bulkhead
- ✅ **7 API Endpoints:** Each demonstrates different protections
- ✅ **6 Test Scenarios:** Automated tests for all fault conditions
- ✅ **Production Ready:** Proper error handling, logging, monitoring
- ✅ **Well Documented:** 5 documentation files + inline comments
- ✅ **Real-world Examples:** Rate limiting, circuit breaking, etc.
- ✅ **Performance Monitoring:** Admin endpoints for stats
- ✅ **Easy to Customize:** Clear config sections

---

## 💡 RECOMMENDED READING ORDER

### If you have 30 minutes:

1. QUICK_REFERENCE.md
2. Setup the services
3. Run `npm test`
4. Try a few curl commands

### If you have 1 hour:

1. QUICK_REFERENCE.md
2. README.md (main sections)
3. Setup & run tests
4. Study one manager file

### If you have 3+ hours:

1. Read all documentation
2. Study all code files
3. Run tests with service down
4. Modify config and test
5. Deploy your own version

---

## 🎯 USE CASES

### I want to...

**...understand fault tolerance**
→ Start with QUICK_REFERENCE.md + README.md

**...run the project**
→ Follow SETUP.md

**...see how it works**
→ Run tests in test-scenarios.js

**...learn the patterns**
→ Study ARCHITECTURE.md + code files

**...modify for my project**
→ Copy manager files from service-a/

**...deploy to production**
→ Use /with-all-protections endpoint

**...monitor system**
→ Check /admin/stats regularly

---

## 📊 STATISTICS

| Metric                   | Value       |
| ------------------------ | ----------- |
| Total Files              | 13          |
| Total Lines of Code      | 3,500+      |
| Documentation Pages      | 5           |
| API Endpoints            | 7 + 9 admin |
| Test Scenarios           | 6           |
| Fault Tolerance Patterns | 4           |
| Code Examples            | 50+         |
| Diagrams                 | 7           |

---

## ✅ VALIDATION CHECKLIST

After setup, verify:

- [ ] Service B running on port 3001
- [ ] Service A running on port 3000
- [ ] Health checks respond (200)
- [ ] Test scenarios complete successfully
- [ ] All 7 endpoints work
- [ ] Admin stats endpoint returns data
- [ ] Logs show all operations

---

## 🆘 HELP & SUPPORT

**Question:** How do I start?
→ Read QUICK_REFERENCE.md

**Question:** How do I install?
→ Follow SETUP.md Bước 1-3

**Question:** How does Retry work?
→ Read README.md section on Retry + retryManager.js code

**Question:** How does Circuit Breaker work?
→ Read ARCHITECTURE.md state machine diagram

**Question:** Why is my request timing out?
→ Check SETUP.md Troubleshooting section

**Question:** How do I customize?
→ See QUICK_REFERENCE.md "Configuration" section

---

## 🔗 FILE RELATIONSHIPS

```
QUICK_REFERENCE.md (START)
    ├─→ SETUP.md (Run Services)
    │   ├─→ service-a/server.js (Main)
    │   └─→ service-b/server.js (Mock Provider)
    │
    ├─→ README.md (Learn)
    │   ├─→ retryManager.js
    │   ├─→ circuitBreakerManager.js
    │   ├─→ rateLimiterManager.js
    │   └─→ bulkheadManager.js
    │
    ├─→ ARCHITECTURE.md (Understand)
    │   └─→ [All code files]
    │
    └─→ SUMMARY.md (Overview)
        └─→ [Reference]
```

---

## 🎓 LEARNING OUTCOMES

After completing this project, you will understand:

1. ✅ Retry mechanism with exponential backoff
2. ✅ Circuit breaker pattern and state machine
3. ✅ Rate limiting algorithms
4. ✅ Bulkhead isolation pattern
5. ✅ How to combine protections
6. ✅ Monitoring and metrics
7. ✅ Testing fault scenarios
8. ✅ Production-ready error handling

---

## 📝 NOTES

- **Language:** Vietnamese + English
- **Framework:** Express.js
- **HTTP Client:** Axios
- **Circuit Breaker:** Opossum
- **Logging:** Pino
- **Node Version:** 16+
- **Installation Time:** ~2 minutes
- **First Test Run:** ~1 minute

---

**Total Project Size:** ~3,500 lines of code + documentation  
**Estimated Learning Time:** 2-4 hours  
**Difficulty:** Intermediate  
**Author:** Đặng Công Huyền (22654611)  
**Date:** Feb 2, 2026

---

**👉 START HERE: Read QUICK_REFERENCE.md first!**
