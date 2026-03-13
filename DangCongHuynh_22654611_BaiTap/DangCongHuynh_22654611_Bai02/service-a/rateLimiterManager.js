/**
 * RATE LIMITER
 * ============
 * Mục đích: Giới hạn số lượng requests từ client tới server trong một khoảng thời gian
 *
 * Lợi ích:
 * - Ngăn chặn abuse/attack
 * - Bảo vệ server khỏi overload
 * - Đảm bảo fair usage giữa các clients
 * - Giảm cost của service dependency
 *
 * Triển khai:
 * - Window-based: Đơn giản nhưng có edge case
 * - Sliding window: Chính xác hơn
 * - Token bucket: Linh hoạt, cho phép burst
 *
 * Khi nào sử dùng:
 * - Public API
 * - External service dependency có quota
 * - Muốn kiểm soát traffic
 * - Cần prevent abuse
 */

const rateLimit = require("express-rate-limit");
const pino = require("pino");
const logger = pino({ transport: { target: "pino-pretty" } });

/**
 * Tạo Rate Limiter cho client-side requests
 * (Middleware dùng khi Service A gọi tới Service B)
 */
class ClientRateLimiter {
  constructor(config = {}) {
    this.maxRequests = config.maxRequests || 3; // 3 requests (fast testing)
    this.windowMs = config.windowMs || 60000; // per 60 seconds
    this.name = config.name || "DefaultRateLimiter";
    this.store = config.store || null; // Memory store mặc định
  }

  /**
   * Log khi rate limit bị hit
   */
  onLimitReached(req, res) {
    logger.warn({
      msg: `[RATE-LIMITER] ${this.name} - Rate limit exceeded`,
      ip: req.ip,
      path: req.path,
      method: req.method,
      limit: `${this.maxRequests}/${this.windowMs}ms`,
    });
  }

  /**
   * Middleware cho Express routes
   */
  getMiddleware() {
    const limiter = rateLimit({
      windowMs: this.windowMs,
      max: this.maxRequests,
      message: {
        error: "Too Many Requests",
        message: `Rate limit exceeded: ${this.maxRequests} requests per ${this.windowMs / 1000} seconds`,
      },
      standardHeaders: true, // Return rate limit info in headers
      legacyHeaders: false, // Disable X-RateLimit-* headers
      statusCode: 429,
      skip: (req) => false,
      onLimitReached: (req, res) => this.onLimitReached(req, res),
    });

    return limiter;
  }
}

/**
 * Custom Rate Limiter cho internal HTTP client calls
 * Để kiểm soát requests từ Service A tới Service B
 */
class HttpClientRateLimiter {
  constructor(config = {}) {
    this.maxRequests = config.maxRequests || 20; // requests
    this.windowMs = config.windowMs || 60000; // ms
    this.name = config.name || "HttpClientRateLimiter";

    // Tracking requests
    this.requestTimestamps = [];
  }

  /**
   * Kiểm tra xem có thể gửi request không
   */
  async canMakeRequest() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Xóa các timestamps cũ (ngoài window)
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => ts > windowStart,
    );

    // Kiểm tra xem vượt quá limit không
    if (this.requestTimestamps.length >= this.maxRequests) {
      logger.warn({
        msg: `[HTTP-RATE-LIMITER] ${this.name} - Rate limit reached`,
        currentRequests: this.requestTimestamps.length,
        maxRequests: this.maxRequests,
        windowMs: this.windowMs,
      });

      // Tính thời gian cần chờ
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = oldestRequest + this.windowMs - now;

      return {
        allowed: false,
        waitTime: Math.max(0, waitTime),
        message: `Rate limit exceeded. Please retry after ${waitTime}ms`,
      };
    }

    // Có thể gửi request
    this.requestTimestamps.push(now);

    logger.debug({
      msg: `[HTTP-RATE-LIMITER] ${this.name} - Request allowed`,
      currentRequests: this.requestTimestamps.length,
      maxRequests: this.maxRequests,
    });

    return {
      allowed: true,
      remainingRequests: this.maxRequests - this.requestTimestamps.length,
    };
  }

  /**
   * Async wrapper để đảm bảo rate limit trước khi gửi request
   */
  async executeWithRateLimit(requestFn, requestName = "Request") {
    const checkResult = await this.canMakeRequest();

    if (!checkResult.allowed) {
      logger.error({
        msg: `[HTTP-RATE-LIMITER] ${requestName} - Rate limited`,
        waitTime: checkResult.waitTime,
      });

      const error = new Error(checkResult.message);
      error.retryAfter = checkResult.waitTime;
      throw error;
    }

    logger.info({
      msg: `[HTTP-RATE-LIMITER] ${requestName} - Executing request`,
      remainingRequests: checkResult.remainingRequests,
    });

    return await requestFn();
  }

  /**
   * Lấy thống kê
   */
  getStats() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const activeRequests = this.requestTimestamps.filter(
      (ts) => ts > windowStart,
    ).length;

    return {
      name: this.name,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      activeRequests,
      availableRequests: Math.max(0, this.maxRequests - activeRequests),
      utilization: ((activeRequests / this.maxRequests) * 100).toFixed(2) + "%",
    };
  }

  /**
   * Reset rate limiter
   */
  reset() {
    this.requestTimestamps = [];
    logger.info({
      msg: `[HTTP-RATE-LIMITER] ${this.name} - Reset`,
    });
  }
}

module.exports = {
  ClientRateLimiter,
  HttpClientRateLimiter,
};
