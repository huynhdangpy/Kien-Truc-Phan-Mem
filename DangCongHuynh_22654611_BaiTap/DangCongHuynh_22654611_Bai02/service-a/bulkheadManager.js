/**
 * BULKHEAD PATTERN
 * ================
 * Mục đích: Cách ly resources để ngăn chặn một service lỗi ảnh hưởng tới service khác
 *
 * Ý tưởng: Giống như các khoang kín trong tàu - nếu một khoang bị dập nước,
 * nó không ảnh hưởng tới những khoang khác
 *
 * Triển khai: Sử dụng queue + worker threads để giới hạn số lượng concurrent requests
 *
 * Lợi ích:
 * - Ngăn chặn resource exhaustion
 * - Bảo vệ service khỏi cascading failures
 * - Đảm bảo fair allocation của resources
 * - Tránh thread pool exhaustion
 *
 * Khi nào sử dụng:
 * - Có nhiều external service dependency
 * - Resources có giới hạn (connection pool, memory)
 * - Muốn tránh một slow service ảnh hưởng tới các service khác
 */

const pino = require("pino");
const logger = pino({ transport: { target: "pino-pretty" } });

/**
 * Simple Queue-based Bulkhead Implementation
 * Giới hạn số lượng concurrent requests bằng queue
 */
class BulkheadManager {
  constructor(config = {}) {
    this.maxConcurrent = config.maxConcurrent || 5; // Max requests cùng lúc
    this.maxQueueSize = config.maxQueueSize || 20; // Max requests trong queue
    this.timeout = config.timeout || 10000; // Timeout cho request
    this.name = config.name || "DefaultBulkhead";

    // Queue để lưu các requests đang chờ
    this.queue = [];
    // Số lượng requests đang thực thi
    this.activeCount = 0;
  }

  /**
   * Lấy số lượng requests có sẵn (slots)
   */
  getAvailableSlots() {
    return Math.max(0, this.maxConcurrent - this.activeCount);
  }

  /**
   * Thực hiện request với bulkhead protection
   */
  async execute(requestFn, requestName = "Request") {
    // Kiểm tra queue size
    if (this.queue.length >= this.maxQueueSize) {
      logger.error({
        msg: `[BULKHEAD] ${requestName} - Queue is full`,
        bulkheadName: this.name,
        queueSize: this.queue.length,
        maxQueueSize: this.maxQueueSize,
      });
      throw new Error(`${this.name} Bulkhead queue is full`);
    }

    // Nếu có slot sẵn, execute ngay
    if (this.activeCount < this.maxConcurrent) {
      return this._executeRequest(requestFn, requestName);
    }

    // Nếu không, thêm vào queue và chờ
    return new Promise((resolve, reject) => {
      const queuedRequest = { requestFn, requestName, resolve, reject };
      this.queue.push(queuedRequest);

      logger.info({
        msg: `[BULKHEAD] ${requestName} - Request queued`,
        bulkheadName: this.name,
        queueLength: this.queue.length,
        activeCount: this.activeCount,
        maxConcurrent: this.maxConcurrent,
      });

      // Setup timeout cho request
      const timeoutId = setTimeout(() => {
        const index = this.queue.indexOf(queuedRequest);
        if (index !== -1) {
          this.queue.splice(index, 1);
          logger.error({
            msg: `[BULKHEAD] ${requestName} - Queued request timeout`,
            bulkheadName: this.name,
          });
          reject(new Error(`${requestName} timeout waiting in bulkhead queue`));
        }
      }, this.timeout);

      queuedRequest.timeoutId = timeoutId;
    });
  }

  /**
   * Internal execute function
   */
  async _executeRequest(requestFn, requestName) {
    this.activeCount++;

    logger.info({
      msg: `[BULKHEAD] ${requestName} - Executing`,
      bulkheadName: this.name,
      activeCount: this.activeCount,
      maxConcurrent: this.maxConcurrent,
    });

    try {
      const result = await requestFn();

      logger.info({
        msg: `[BULKHEAD] ${requestName} - Completed`,
        bulkheadName: this.name,
        activeCount: this.activeCount,
      });

      return result;
    } catch (error) {
      logger.error({
        msg: `[BULKHEAD] ${requestName} - Failed`,
        error: error.message,
        bulkheadName: this.name,
        activeCount: this.activeCount,
      });
      throw error;
    } finally {
      this.activeCount--;

      // Xử lý request tiếp theo trong queue
      if (this.queue.length > 0) {
        const nextRequest = this.queue.shift();
        clearTimeout(nextRequest.timeoutId);

        logger.info({
          msg: `[BULKHEAD] ${nextRequest.requestName} - Processing from queue`,
          bulkheadName: this.name,
          remainingQueueSize: this.queue.length,
        });

        this._executeRequest(nextRequest.requestFn, nextRequest.requestName)
          .then(nextRequest.resolve)
          .catch(nextRequest.reject);
      }
    }
  }

  /**
   * Lấy thống kê
   */
  getStats() {
    return {
      name: this.name,
      activeCount: this.activeCount,
      maxConcurrent: this.maxConcurrent,
      availableSlots: this.getAvailableSlots(),
      queueLength: this.queue.length,
      maxQueueSize: this.maxQueueSize,
      utilization:
        ((this.activeCount / this.maxConcurrent) * 100).toFixed(2) + "%",
    };
  }

  /**
   * Reset bulkhead
   */
  reset() {
    this.queue = [];
    this.activeCount = 0;
    logger.info({
      msg: `[BULKHEAD] ${this.name} - Reset`,
    });
  }
}

module.exports = BulkheadManager;
