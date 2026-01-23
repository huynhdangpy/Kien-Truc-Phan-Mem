/**
 * BÀI TẬP 1: KIẾN TRÚC PHẦN MỀM
 * Scalability, Performance, Security
 */

// ============================================================
// 1. SCALABILITY - Khả năng mở rộng
// ============================================================

// Cách 1: Load Balancer Pattern
class LoadBalancer {
  constructor() {
    this.servers = [];
    this.currentIndex = 0;
  }

  addServer(server) {
    this.servers.push(server);
  }

  // Round-robin distribution
  getNextServer() {
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    return server;
  }

  async handleRequest(request) {
    const server = this.getNextServer();
    return await server.process(request);
  }
}

// Cách 2: Message Queue Pattern (Scalability)
class MessageQueue {
  constructor() {
    this.queue = [];
    this.workers = [];
  }

  addWorker(worker) {
    this.workers.push(worker);
  }

  async publish(message) {
    this.queue.push(message);
    this.processQueue();
  }

  async processQueue() {
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      const worker =
        this.workers[Math.floor(Math.random() * this.workers.length)];
      await worker.process(message);
    }
  }
}

// Cách 3: Database Sharding
class ShardedDatabase {
  constructor(shardCount = 3) {
    this.shards = Array(shardCount)
      .fill()
      .map(() => new Map());
    this.shardCount = shardCount;
  }

  getShardId(key) {
    return key.charCodeAt(0) % this.shardCount;
  }

  set(key, value) {
    const shardId = this.getShardId(key);
    this.shards[shardId].set(key, value);
  }

  get(key) {
    const shardId = this.getShardId(key);
    return this.shards[shardId].get(key);
  }
}

// ============================================================
// 2. PERFORMANCE - Hiệu suất
// ============================================================

// Cách 1: Caching Strategy (Redis Pattern)
class Cache {
  constructor(ttl = 300000) {
    // 5 phút
    this.store = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }
}

// Cách 2: Connection Pooling
class ConnectionPool {
  constructor(maxConnections = 10) {
    this.available = [];
    this.inUse = new Set();
    this.maxConnections = maxConnections;

    // Initialize connections
    for (let i = 0; i < maxConnections; i++) {
      this.available.push({ id: i, ready: true });
    }
  }

  async acquire() {
    if (this.available.length === 0) {
      // Wait for available connection
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.acquire();
    }

    const conn = this.available.pop();
    this.inUse.add(conn);
    return conn;
  }

  release(conn) {
    this.inUse.delete(conn);
    this.available.push(conn);
  }
}

// Cách 3: Request Debouncing & Throttling
class PerformanceOptimizer {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// Cách 4: Batch Processing
class BatchProcessor {
  constructor(batchSize = 100, processingTime = 1000) {
    this.batch = [];
    this.batchSize = batchSize;
    this.processingTime = processingTime;
    this.timer = null;
  }

  add(item) {
    this.batch.push(item);

    if (this.batch.length >= this.batchSize) {
      this.process();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.process(), this.processingTime);
    }
  }

  process() {
    if (this.batch.length === 0) return;

    console.log(`Processing batch of ${this.batch.length} items`);
    // Process batch
    const processed = [...this.batch];
    this.batch = [];
    clearTimeout(this.timer);
    this.timer = null;

    return processed;
  }
}

// ============================================================
// 3. SECURITY - Bảo mật
// ============================================================

// Cách 1: Input Validation & Sanitization
class SecurityValidator {
  static sanitizeInput(input) {
    if (typeof input !== "string") return "";
    return input
      .replace(/[<>]/g, "") // Remove HTML tags
      .trim()
      .substring(0, 255); // Limit length
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  }

  static validateSQL(query) {
    const sqlInjectionPatterns = [
      /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)\b)/i,
      /'.*--/,
      /;.*--.*/,
    ];
    return !sqlInjectionPatterns.some((pattern) => pattern.test(query));
  }
}

// Cách 2: Rate Limiting
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(clientId) {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];

    // Remove old requests outside window
    const validRequests = clientRequests.filter(
      (time) => now - time < this.windowMs,
    );

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(clientId, validRequests);
    return true;
  }
}

// Cách 3: CORS & Authentication
class SecurityMiddleware {
  static validateCORS(origin, allowedOrigins) {
    return allowedOrigins.includes(origin);
  }

  static hashPassword(password) {
    // Simple hash (In production use bcrypt)
    return Buffer.from(password).toString("base64");
  }

  static generateToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  static verifyToken(token, validTokens) {
    return validTokens.has(token);
  }
}

// Cách 4: Data Encryption
class EncryptionService {
  static encryptSimple(data) {
    return Buffer.from(data).toString("base64");
  }

  static decryptSimple(encrypted) {
    return Buffer.from(encrypted, "base64").toString("utf-8");
  }

  static maskSensitiveData(data, showChars = 4) {
    if (data.length <= showChars) return "*".repeat(data.length);
    return data.substring(0, showChars) + "*".repeat(data.length - showChars);
  }
}

// ============================================================
// EXAMPLE USAGE
// ============================================================

// Example 1: Scalability with Load Balancer
console.log("--- SCALABILITY EXAMPLE ---");
const lb = new LoadBalancer();
const server1 = { process: async (req) => `Server 1: ${req}` };
const server2 = { process: async (req) => `Server 2: ${req}` };
lb.addServer(server1);
lb.addServer(server2);

// Example 2: Performance with Cache
console.log("\n--- PERFORMANCE EXAMPLE ---");
const cache = new Cache(5000);
cache.set("user:1", { name: "John", id: 1 });
console.log("From cache:", cache.get("user:1")); // Fast retrieval

// Example 3: Security
console.log("\n--- SECURITY EXAMPLE ---");
console.log(
  "Valid email:",
  SecurityValidator.validateEmail("user@example.com"),
);
console.log(
  "Password valid:",
  SecurityValidator.validatePassword("SecurePass123!"),
);
console.log(
  "Masked card:",
  EncryptionService.maskSensitiveData("1234567890123456"),
);

// Example 4: Rate Limiting
const rateLimiter = new RateLimiter(3, 10000);
console.log("\n--- RATE LIMITING EXAMPLE ---");
console.log("Request 1:", rateLimiter.isAllowed("user1")); // true
console.log("Request 2:", rateLimiter.isAllowed("user1")); // true
console.log("Request 3:", rateLimiter.isAllowed("user1")); // true
console.log("Request 4:", rateLimiter.isAllowed("user1")); // false

module.exports = {
  LoadBalancer,
  MessageQueue,
  ShardedDatabase,
  Cache,
  ConnectionPool,
  PerformanceOptimizer,
  BatchProcessor,
  SecurityValidator,
  RateLimiter,
  SecurityMiddleware,
  EncryptionService,
};
