/**
 * CIRCUIT BREAKER PATTERN
 * =======================
 * Mục đích: Ngăn chặn cascade failures bằng cách dừng requests tới service lỗi
 *
 * Các trạng thái:
 * 1. CLOSED (bình thường): Requests đi qua bình thường
 * 2. OPEN (service down): Requests bị block ngay lập tức
 * 3. HALF_OPEN (recovery): Thử từng request để kiểm tra service đã khôi phục chưa
 *
 * Flow:
 * CLOSED --> OPEN (khi error rate cao) --> HALF_OPEN (sau timeout) --> CLOSED (nếu thành công)
 *
 * Lợi ích:
 * - Ngăn chặn lãng phí resources vào service lỗi
 * - Fail fast thay vì timeout chờ
 * - Cho phép service khôi phục
 * - Cải thiện user experience (fail nhanh hơn)
 *
 * Khi nào sử dụng:
 * - Service dependency quan trọng
 * - Muốn ngăn chặn cascade failures
 * - Cần nhanh chóng phát hiện service không khả dụng
 */

const Opossum = require("opossum");
const pino = require("pino");
const logger = pino({ transport: { target: "pino-pretty" } });

/**
 * Circuit Breaker configuration
 * - timeout: request timeout (ms)
 * - errorThresholdPercentage: % lỗi để trigger OPEN (0-100)
 * - resetTimeout: thời gian chờ trước khi try HALF_OPEN (ms)
 * - volumeThreshold: số requests tối thiểu để evaluate error rate
 */
class CircuitBreakerManager {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 3000,
      errorThresholdPercentage: config.errorThresholdPercentage || 50,
      resetTimeout: config.resetTimeout || 30000, // 30 seconds
      volumeThreshold: config.volumeThreshold || 10,
      name: config.name || "DefaultCircuitBreaker",
    };

    // Tạo circuit breaker wrapper
    this.breaker = new Opossum(
      async (requestFn) => {
        return await requestFn();
      },
      {
        timeout: this.config.timeout,
        errorThresholdPercentage: this.config.errorThresholdPercentage,
        resetTimeout: this.config.resetTimeout,
        volumeThreshold: this.config.volumeThreshold,
        name: this.config.name,
      },
    );

    // Event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Khi breaker chuyển sang OPEN
    this.breaker.fallback(() => {
      logger.error({
        msg: `[CIRCUIT-BREAKER] ${this.config.name} - CIRCUIT OPENED`,
        state: "OPEN",
      });
      throw new Error(`${this.config.name} Circuit Breaker is OPEN`);
    });

    // Health check listener
    this.breaker.on("open", () => {
      logger.error({
        msg: `[CIRCUIT-BREAKER] ${this.config.name} - State changed to OPEN`,
        state: "OPEN",
      });
    });

    this.breaker.on("halfOpen", () => {
      logger.warn({
        msg: `[CIRCUIT-BREAKER] ${this.config.name} - State changed to HALF_OPEN`,
        state: "HALF_OPEN",
      });
    });

    this.breaker.on("close", () => {
      logger.info({
        msg: `[CIRCUIT-BREAKER] ${this.config.name} - State changed to CLOSED`,
        state: "CLOSED",
      });
    });

    this.breaker.on("success", (result) => {
      const stats = this.breaker.stats;
      logger.debug({
        msg: `[CIRCUIT-BREAKER] ${this.config.name} - Request successful`,
        state: this.breaker.opened ? "OPEN" : "CLOSED",
        successCount: stats.successes,
      });
    });

    this.breaker.on("failure", (error) => {
      logger.warn({
        msg: `[CIRCUIT-BREAKER] ${this.config.name} - Request failed`,
        error: error.message,
        state: this.breaker.opened ? "OPEN" : "CLOSED",
      });
    });
  }

  /**
   * Thực hiện request với Circuit Breaker protection
   */
  async execute(requestFn, requestName = "Request") {
    try {
      logger.info({
        msg: `[CIRCUIT-BREAKER] ${requestName} - Executing request`,
        state: this.getState(),
      });

      const result = await this.breaker.fire(async () => {
        return await requestFn();
      });

      return result;
    } catch (error) {
      if (this.breaker.opened) {
        logger.error({
          msg: `[CIRCUIT-BREAKER] ${requestName} - Circuit is OPEN, request rejected`,
          state: "OPEN",
          error: error.message,
        });
      }
      throw error;
    }
  }

  /**
   * Lấy trạng thái hiện tại
   */
  getState() {
    if (this.breaker.opened) {
      return "OPEN";
    } else if (this.breaker.halfOpen) {
      return "HALF_OPEN";
    } else {
      return "CLOSED";
    }
  }

  /**
   * Lấy thống kê
   */
  getStats() {
    const stats = this.breaker.stats;
    return {
      state: this.getState(),
      successes: stats.successes,
      failures: stats.failures,
      timeouts: stats.timeouts,
      fires: stats.fires,
      fallbacks: stats.fallbacks,
      successRate:
        stats.fires > 0
          ? ((stats.successes / stats.fires) * 100).toFixed(2) + "%"
          : "0%",
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.breaker.close();
    logger.info({
      msg: `[CIRCUIT-BREAKER] ${this.config.name} - Circuit reset to CLOSED`,
    });
  }
}

module.exports = CircuitBreakerManager;
