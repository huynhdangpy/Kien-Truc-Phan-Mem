/**
 * SERVICE B - PROVIDER
 * =====================
 * Dịch vụ provider cung cấp dữ liệu với các endpoints khác nhau để mô phỏng các kịch bản:
 * 1. /api/health - Trả về trạng thái healthy
 * 2. /api/data - Endpoint bình thường
 * 3. /api/slow - Endpoint chậm (timeout)
 * 4. /api/error - Endpoint trả về lỗi
 * 5. /api/overload - Endpoint mô phỏng overload
 */

const express = require("express");
const pino = require("pino");
const logger = pino({ transport: { target: "pino-pretty" } });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Biến toàn cục để kiểm soát trạng thái service
let isHealthy = true;
let slowResponseDelay = 0;
let errorRate = 0;
let requestCount = 0;

/**
 * ENDPOINT 1: Health Check
 * Mục đích: Để Service A kiểm tra xem Service B có hoạt động hay không
 */
app.get("/api/health", (req, res) => {
  logger.info("[SERVICE-B] Health check request");
  res.status(200).json({
    status: "healthy",
    service: "Service B - Provider",
    timestamp: new Date().toISOString(),
  });
});

/**
 * ENDPOINT 2: Normal Data Request
 * Mục đích: Trả về dữ liệu bình thường
 */
app.get("/api/data", (req, res) => {
  requestCount++;
  logger.info({
    msg: "[SERVICE-B] Data request",
    requestCount,
    requestId: req.query.requestId,
  });

  if (!isHealthy) {
    return res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Service B is down for maintenance",
    });
  }

  const data = {
    id: Math.floor(Math.random() * 1000),
    name: `Product ${Math.floor(Math.random() * 100)}`,
    price: Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: data,
    requestId: req.query.requestId,
  });
});

/**
 * ENDPOINT 3: Slow Response (mô phỏng timeout)
 * Mục đích: Mô phỏng service chậm để test retry và timeout
 * Query params:
 *   - delay: số milliseconds để delay (mặc định 5000)
 */
app.get("/api/slow", async (req, res) => {
  const delay = parseInt(req.query.delay) || 5000;
  logger.warn({
    msg: "[SERVICE-B] Slow response request",
    delay,
    requestId: req.query.requestId,
  });

  // Simulate slow processing
  await new Promise((resolve) => setTimeout(resolve, delay));

  res.status(200).json({
    success: true,
    message: `Response delayed by ${delay}ms`,
    requestId: req.query.requestId,
  });
});

/**
 * ENDPOINT 4: Error Response
 * Mục đích: Mô phỏng service lỗi
 * Query params:
 *   - statusCode: mã lỗi HTTP (mặc định 500)
 *   - errorRate: tỷ lệ phần trăm lỗi (0-100)
 */
app.get("/api/error", (req, res) => {
  const statusCode = parseInt(req.query.statusCode) || 500;
  const rate = parseInt(req.query.rate) || 100; // 100% = luôn lỗi

  logger.warn({
    msg: "[SERVICE-B] Error request",
    statusCode,
    errorRate: rate + "%",
    requestId: req.query.requestId,
  });

  // Random error based on rate
  if (Math.random() * 100 < rate) {
    return res.status(statusCode).json({
      error: `Error with status code ${statusCode}`,
      message: "Service B encountered an error",
      requestId: req.query.requestId,
    });
  }

  res.status(200).json({
    success: true,
    message: "No error this time",
    requestId: req.query.requestId,
  });
});

/**
 * ENDPOINT 5: Overload Simulation
 * Mục đích: Mô phỏng service quá tải
 * Query params:
 *   - maxRequest: số request tối đa được xử lý (mặc định 5)
 */
app.get("/api/overload", (req, res) => {
  const maxRequests = parseInt(req.query.maxRequests) || 5;

  logger.info({
    msg: "[SERVICE-B] Overload endpoint request",
    currentRequests: requestCount,
    maxRequests,
    requestId: req.query.requestId,
  });

  if (requestCount > maxRequests) {
    logger.error({
      msg: "[SERVICE-B] Service overloaded",
      currentRequests: requestCount,
      maxRequests,
      requestId: req.query.requestId,
    });
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Service B is overloaded",
      retryAfter: 5,
      requestId: req.query.requestId,
    });
  }

  res.status(200).json({
    success: true,
    message: "Request processed successfully",
    currentRequests: requestCount,
    requestId: req.query.requestId,
  });
});

/**
 * ADMIN ENDPOINTS - Để kiểm soát trạng thái service
 */

// Set service health status
app.post("/admin/health/:status", (req, res) => {
  isHealthy = req.params.status === "up";
  logger.info({
    msg: "[ADMIN] Health status changed",
    status: isHealthy ? "UP" : "DOWN",
  });
  res.json({ status: isHealthy ? "UP" : "DOWN" });
});

// Reset request counter
app.post("/admin/reset", (req, res) => {
  requestCount = 0;
  logger.info("[ADMIN] Request counter reset");
  res.json({ message: "Counter reset", requestCount });
});

// Get current stats
app.get("/admin/stats", (req, res) => {
  res.json({
    requestCount,
    isHealthy,
    uptime: process.uptime(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error({ msg: "Unhandled error", error: err.message });
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`
[SERVICE B - PROVIDER] Started
================================================
Server running at: http://localhost:${PORT}

Endpoints:
  [GET]  /api/health              - Health check
  [GET]  /api/data                - Normal response
  [GET]  /api/slow?delay=5000     - Slow response (timeout)
  [GET]  /api/error?rate=100      - Error response
  [GET]  /api/overload            - Overload simulation
  
Admin Endpoints:
  [POST] /admin/health/:status    - Control health (up/down)
  [POST] /admin/reset             - Reset counter
  [GET]  /admin/stats             - Get stats

Press Ctrl+C to stop server
================================================
  `);
});

module.exports = app;
