/**
 * SERVICE A - API GATEWAY / CLIENT
 * ==================================
 *
 * Điểm truy cập chính cho hệ thống.
 * Chứa các kỹ thuật Fault Tolerance:
 * 1. Retry - Tự động retry request khi lỗi
 * 2. Circuit Breaker - Ngăn chặn cascade failures
 * 3. Rate Limiter - Giới hạn traffic
 * 4. Bulkhead - Cách ly resources
 *
 * Luồng xử lý:
 * Client Request
 *    ↓
 * Rate Limiter (kiểm tra traffic limit)
 *    ↓
 * Bulkhead (kiểm tra available slots)
 *    ↓
 * Circuit Breaker (kiểm tra trạng thái)
 *    ↓
 * Retry (thử lại nếu lỗi)
 *    ↓
 * Service B (HTTP request)
 */

const express = require("express");
const axios = require("axios");
const pino = require("pino");
const { v4: uuidv4 } = require("uuid");

// Import managers
const RetryManager = require("./retryManager");
const CircuitBreakerManager = require("./circuitBreakerManager");
const { HttpClientRateLimiter } = require("./rateLimiterManager");
const BulkheadManager = require("./bulkheadManager");

// Logger
const logger = pino({ transport: { target: "pino-pretty" } });

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_B_URL = process.env.SERVICE_B_URL || "http://localhost:3001";

// Middleware
app.use(express.json());

// ============================================================
// FAULT TOLERANCE MANAGERS INITIALIZATION
// ============================================================

// 1. RETRY MANAGER
const retryManager = new RetryManager({
  maxRetries: 3,
  initialDelay: 100,
  backoffMultiplier: 2,
  maxDelay: 5000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
});

// 2. CIRCUIT BREAKER MANAGER
const circuitBreakerManager = new CircuitBreakerManager({
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds
  volumeThreshold: 10,
  name: "ServiceBCircuitBreaker",
});

// 3. RATE LIMITER (HTTP CLIENT - Service A → Service B)
const rateLimiter = new HttpClientRateLimiter({
  maxRequests: 3, // 3 requests (fast testing)
  windowMs: 60000, // per 60 seconds
  name: "ServiceBRateLimiter",
});

// 4. BULKHEAD MANAGER
const bulkheadManager = new BulkheadManager({
  maxConcurrent: 5, // Max 5 concurrent requests
  maxQueueSize: 5, // Max 5 requests in queue (for testing)
  timeout: 30000,
  name: "ServiceBBulkhead",
});

// ============================================================
// ENDPOINT 1: Health Check
// ============================================================
/**
 * Kiểm tra trạng thái của Service A
 */
app.get("/api/health", (req, res) => {
  logger.info("[SERVICE-A] Health check");
  res.status(200).json({
    status: "healthy",
    service: "Service A - API Gateway",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// ENDPOINT 2: Call Service B without Fault Tolerance (baseline)
// ============================================================
/**
 * Call Service B mà không có Fault Tolerance
 * Dùng để so sánh và thấy tác động của Fault Tolerance
 */
app.get("/api/no-protection", async (req, res) => {
  const requestId = uuidv4();

  try {
    logger.info({
      msg: "[SERVICE-A] No Protection - Call Service B",
      requestId,
    });

    const response = await axios.get(`${SERVICE_B_URL}/api/data`, {
      params: { requestId },
      timeout: 3000,
    });

    logger.info({
      msg: "[SERVICE-A] No Protection - Success",
      requestId,
      status: response.status,
    });

    res.status(200).json({
      method: "no-protection",
      success: true,
      data: response.data,
      requestId,
    });
  } catch (error) {
    logger.error({
      msg: "[SERVICE-A] No Protection - Error",
      requestId,
      error: error.message,
      status: error.response?.status,
    });

    res.status(error.response?.status || 500).json({
      method: "no-protection",
      success: false,
      error: error.message,
      requestId,
    });
  }
});

// ============================================================
// ENDPOINT 3: Call Service B WITH Retry
// ============================================================
/**
 * Gọi Service B với Retry logic
 * Sẽ tự động retry nếu gặp lỗi tạm thời
 */
app.get("/api/with-retry", async (req, res) => {
  const requestId = uuidv4();

  try {
    logger.info({
      msg: "[SERVICE-A] With Retry - Start",
      requestId,
    });

    const result = await retryManager.executeWithRetry(async () => {
      const response = await axios.get(`${SERVICE_B_URL}/api/data`, {
        params: { requestId },
        timeout: 3000,
      });
      return response.data;
    }, `WithRetry-${requestId}`);

    logger.info({
      msg: "[SERVICE-A] With Retry - Success",
      requestId,
    });

    res.status(200).json({
      method: "with-retry",
      success: true,
      data: result,
      requestId,
    });
  } catch (error) {
    logger.error({
      msg: "[SERVICE-A] With Retry - Failed after retries",
      requestId,
      error: error.message,
    });

    res.status(500).json({
      method: "with-retry",
      success: false,
      error: error.message,
      requestId,
    });
  }
});

// ============================================================
// ENDPOINT 4: Call Service B WITH Circuit Breaker
// ============================================================
/**
 * Gọi Service B với Circuit Breaker
 * Sẽ block requests khi Service B có vấn đề
 */
app.get("/api/with-circuit-breaker", async (req, res) => {
  const requestId = uuidv4();

  try {
    logger.info({
      msg: "[SERVICE-A] With Circuit Breaker - Start",
      requestId,
      cbState: circuitBreakerManager.getState(),
    });

    const result = await circuitBreakerManager.execute(async () => {
      const response = await axios.get(`${SERVICE_B_URL}/api/data`, {
        params: { requestId },
        timeout: 3000,
      });
      return response.data;
    }, `CircuitBreaker-${requestId}`);

    logger.info({
      msg: "[SERVICE-A] With Circuit Breaker - Success",
      requestId,
      cbState: circuitBreakerManager.getState(),
    });

    res.status(200).json({
      method: "with-circuit-breaker",
      success: true,
      data: result,
      cbState: circuitBreakerManager.getState(),
      cbStats: circuitBreakerManager.getStats(),
      requestId,
    });
  } catch (error) {
    logger.error({
      msg: "[SERVICE-A] With Circuit Breaker - Error",
      requestId,
      error: error.message,
      cbState: circuitBreakerManager.getState(),
    });

    res.status(503).json({
      method: "with-circuit-breaker",
      success: false,
      error: error.message,
      cbState: circuitBreakerManager.getState(),
      cbStats: circuitBreakerManager.getStats(),
      requestId,
    });
  }
});

// ============================================================
// ENDPOINT 5: Call Service B WITH Rate Limiter
// ============================================================
/**
 * Gọi Service B với Rate Limiter
 * Kiểm soát số lượng requests
 */
app.get("/api/with-rate-limiter", async (req, res) => {
  const requestId = uuidv4();

  try {
    logger.info({
      msg: "[SERVICE-A] With Rate Limiter - Start",
      requestId,
      stats: rateLimiter.getStats(),
    });

    await rateLimiter
      .executeWithRateLimit(async () => {
        const response = await axios.get(`${SERVICE_B_URL}/api/data`, {
          params: { requestId },
          timeout: 3000,
        });
        return response.data;
      }, `RateLimiter-${requestId}`)
      .then(async (data) => {
        logger.info({
          msg: "[SERVICE-A] With Rate Limiter - Success",
          requestId,
          stats: rateLimiter.getStats(),
        });

        res.status(200).json({
          method: "with-rate-limiter",
          success: true,
          data,
          stats: rateLimiter.getStats(),
          requestId,
        });
      });
  } catch (error) {
    logger.error({
      msg: "[SERVICE-A] With Rate Limiter - Error",
      requestId,
      error: error.message,
      stats: rateLimiter.getStats(),
    });

    const statusCode = error.retryAfter ? 429 : 500;
    res.status(statusCode).json({
      method: "with-rate-limiter",
      success: false,
      error: error.message,
      retryAfter: error.retryAfter,
      stats: rateLimiter.getStats(),
      requestId,
    });
  }
});

// ============================================================
// ENDPOINT 6: Call Service B WITH Bulkhead
// ============================================================
/**
 * Gọi Service B với Bulkhead
 * Giới hạn số lượng concurrent requests
 */
app.get("/api/with-bulkhead", async (req, res) => {
  const requestId = uuidv4();

  try {
    logger.info({
      msg: "[SERVICE-A] With Bulkhead - Start",
      requestId,
      stats: bulkheadManager.getStats(),
    });

    const result = await bulkheadManager.execute(async () => {
      const response = await axios.get(
        `${SERVICE_B_URL}/api/slow?delay=10000`,
        {
          params: { requestId },
          timeout: 12000,
        },
      );
      return response.data;
    }, `Bulkhead-${requestId}`);

    logger.info({
      msg: "[SERVICE-A] With Bulkhead - Success",
      requestId,
      stats: bulkheadManager.getStats(),
    });

    res.status(200).json({
      method: "with-bulkhead",
      success: true,
      data: result,
      stats: bulkheadManager.getStats(),
      requestId,
    });
  } catch (error) {
    logger.error({
      msg: "[SERVICE-A] With Bulkhead - Error",
      requestId,
      error: error.message,
      stats: bulkheadManager.getStats(),
    });

    const statusCode = error.message.includes("queue is full") ? 429 : 500;
    res.status(statusCode).json({
      method: "with-bulkhead",
      success: false,
      error: error.message,
      stats: bulkheadManager.getStats(),
      requestId,
    });
  }
});

// ============================================================
// ENDPOINT 7: Call Service B WITH ALL Fault Tolerance
// ============================================================
/**
 * Gọi Service B với TẤT CẢ kỹ thuật Fault Tolerance
 * Đây là pattern production-ready hoàn chỉnh
 */
app.get("/api/with-all-protections", async (req, res) => {
  const requestId = uuidv4();

  try {
    logger.info({
      msg: "[SERVICE-A] With All Protections - Start",
      requestId,
      cbState: circuitBreakerManager.getState(),
      bulkhead: bulkheadManager.getStats(),
      rateLimiter: rateLimiter.getStats(),
    });

    // Step 1: Rate Limiter
    // Step 2: Bulkhead
    // Step 3: Circuit Breaker + Retry
    const result = await rateLimiter.executeWithRateLimit(async () => {
      return await bulkheadManager.execute(async () => {
        return await circuitBreakerManager.execute(async () => {
          return await retryManager.executeWithRetry(async () => {
            const response = await axios.get(`${SERVICE_B_URL}/api/data`, {
              params: { requestId },
              timeout: 3000,
            });
            return response.data;
          }, `FullProtection-Retry-${requestId}`);
        }, `FullProtection-CB-${requestId}`);
      }, `FullProtection-Bulkhead-${requestId}`);
    }, `FullProtection-RateLimit-${requestId}`);

    logger.info({
      msg: "[SERVICE-A] With All Protections - Success",
      requestId,
      cbState: circuitBreakerManager.getState(),
    });

    res.status(200).json({
      method: "with-all-protections",
      success: true,
      data: result,
      protections: {
        retry: { maxRetries: 3 },
        circuitBreaker: {
          state: circuitBreakerManager.getState(),
          ...circuitBreakerManager.getStats(),
        },
        rateLimiter: rateLimiter.getStats(),
        bulkhead: bulkheadManager.getStats(),
      },
      requestId,
    });
  } catch (error) {
    logger.error({
      msg: "[SERVICE-A] With All Protections - Error",
      requestId,
      error: error.message,
      cbState: circuitBreakerManager.getState(),
    });

    let statusCode = 500;
    if (error.message.includes("Rate limit")) statusCode = 429;
    if (error.message.includes("queue is full")) statusCode = 429;
    if (error.message.includes("Circuit Breaker")) statusCode = 503;

    res.status(statusCode).json({
      method: "with-all-protections",
      success: false,
      error: error.message,
      protections: {
        retry: { maxRetries: 3 },
        circuitBreaker: {
          state: circuitBreakerManager.getState(),
          ...circuitBreakerManager.getStats(),
        },
        rateLimiter: rateLimiter.getStats(),
        bulkhead: bulkheadManager.getStats(),
      },
      requestId,
    });
  }
});

// ============================================================
// ADMIN ENDPOINTS - để theo dõi trạng thái
// ============================================================

app.get("/admin/stats", (req, res) => {
  res.json({
    circuitBreaker: circuitBreakerManager.getStats(),
    rateLimiter: rateLimiter.getStats(),
    bulkhead: bulkheadManager.getStats(),
  });
});

app.post("/admin/circuit-breaker/reset", (req, res) => {
  circuitBreakerManager.reset();
  res.json({
    message: "Circuit Breaker reset",
    state: circuitBreakerManager.getState(),
  });
});

app.post("/admin/rate-limiter/reset", (req, res) => {
  rateLimiter.reset();
  res.json({ message: "Rate Limiter reset", stats: rateLimiter.getStats() });
});

app.post("/admin/bulkhead/reset", (req, res) => {
  bulkheadManager.reset();
  res.json({ message: "Bulkhead reset", stats: bulkheadManager.getStats() });
});

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((err, req, res, next) => {
  logger.error({ msg: "Unhandled error", error: err.message });
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  logger.info(`
[SERVICE A - API GATEWAY] Started
================================================
Server running at: http://localhost:${PORT}
Service B URL: ${SERVICE_B_URL}

API Endpoints:
  [1] GET /api/health                 - Health check
  [2] GET /api/no-protection          - Baseline (no protection)
  [3] GET /api/with-retry             - With Retry
  [4] GET /api/with-circuit-breaker   - With Circuit Breaker
  [5] GET /api/with-rate-limiter      - With Rate Limiter
  [6] GET /api/with-bulkhead          - With Bulkhead
  [7] GET /api/with-all-protections   - With ALL protections (RECOMMENDED)

Admin Endpoints:
  [GET]  /admin/stats                        - View all stats
  [POST] /admin/circuit-breaker/reset        - Reset Circuit Breaker
  [POST] /admin/rate-limiter/reset           - Reset Rate Limiter
  [POST] /admin/bulkhead/reset               - Reset Bulkhead

Press Ctrl+C to stop server
================================================
  `);
});

module.exports = app;
