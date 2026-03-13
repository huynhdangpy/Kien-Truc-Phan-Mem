/**
 * RETRY MECHANISM
 * ===============
 * Mục đích: Tự động retry request khi gặp lỗi tạm thời
 *
 * Lợi ích:
 * - Xử lý các lỗi tạm thời (network glitches, brief service interruptions)
 * - Tăng độ tin cậy của hệ thống
 * - Giảm số lỗi cho user
 *
 * Khi nào sử dụng:
 * - Kết nối mạng không ổn định
 * - Service khác đang khởi động lại
 * - Tải tạm thời cao
 */

const pino = require("pino");
const logger = pino({ transport: { target: "pino-pretty" } });

/**
 * Retry configuration
 * - maxRetries: số lần retry tối đa
 * - initialDelay: delay ban đầu (ms)
 * - backoffMultiplier: hệ số tăng exponential backoff (2 = gấp đôi)
 * - maxDelay: delay tối đa (ms) để tránh quá lâu
 * - retryableStatusCodes: mã lỗi nên retry
 */
class RetryManager {
  constructor(config = {}) {
    this.maxRetries = config.maxRetries || 3;
    this.initialDelay = config.initialDelay || 100;
    this.backoffMultiplier = config.backoffMultiplier || 2;
    this.maxDelay = config.maxDelay || 5000;
    this.retryableStatusCodes = config.retryableStatusCodes || [
      408, 429, 500, 502, 503, 504,
    ];
  }

  /**
   * Calculate delay với exponential backoff
   * Ví dụ: 100ms -> 200ms -> 400ms -> 800ms...
   */
  calculateDelay(attemptNumber) {
    const delay =
      this.initialDelay * Math.pow(this.backoffMultiplier, attemptNumber);
    return Math.min(delay, this.maxDelay);
  }

  /**
   * Kiểm tra xem có nên retry hay không
   */
  shouldRetry(error, attemptNumber) {
    // Nếu vượt quá số lần retry, không retry nữa
    if (attemptNumber >= this.maxRetries) {
      return false;
    }

    // Nếu là network error, retry
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT"
    ) {
      return true;
    }

    // Nếu là HTTP error và status code trong danh sách retry, thì retry
    if (
      error.response &&
      this.retryableStatusCodes.includes(error.response.status)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Thực hiện request với retry logic
   */
  async executeWithRetry(requestFn, requestName = "Request") {
    let lastError;
    let attemptNumber = 0;

    while (attemptNumber <= this.maxRetries) {
      try {
        logger.info(
          `  -> ${requestName} | Attempt ${attemptNumber + 1}/${this.maxRetries + 1}`,
        );

        const result = await requestFn();

        if (attemptNumber > 0) {
          logger.info(
            `  [SUCCESS] ${requestName} succeeded after ${attemptNumber} retry(s) ✓`,
          );
        }

        return result;
      } catch (error) {
        lastError = error;
        const errorMsg =
          error.response?.statusText || error.code || error.message;
        const statusCode = error.response?.status || "";

        logger.warn(
          `  [RETRY] ${requestName} | Attempt ${attemptNumber + 1} failed - ${statusCode} ${errorMsg}`,
        );

        // Kiểm tra xem có nên retry
        if (this.shouldRetry(error, attemptNumber)) {
          const delay = this.calculateDelay(attemptNumber);
          logger.info(`  [WAITING] Retrying in ${delay}ms...`);

          await new Promise((resolve) => setTimeout(resolve, delay));
          attemptNumber++;
        } else {
          // Không nên retry, throw error
          throw error;
        }
      }
    }

    // Nếu tất cả retry đều thất bại
    logger.error(
      `  [FAILED] ${requestName} - All ${this.maxRetries + 1} attempts failed ✗`,
    );

    throw lastError;
  }
}

module.exports = RetryManager;
