/**
 * TEST SCENARIOS
 * ==============
 *
 * Script này mô phỏng các kịch bản lỗi khác nhau
 * để test các kỹ thuật Fault Tolerance
 *
 * Các kịch bản:
 * 1. Service B chậm (timeout) - Test Retry & Timeout
 * 2. Service B lỗi (5xx) - Test Retry & Circuit Breaker
 * 3. Rate limiting - Test Rate Limiter
 * 4. Concurrent requests - Test Bulkhead
 * 5. Service down - Test Circuit Breaker
 */

const axios = require("axios");
const pino = require("pino");
const logger = pino({ transport: { target: "pino-pretty" } });

const SERVICE_A_URL = process.env.SERVICE_A_URL || "http://localhost:3000";
const SERVICE_B_URL = process.env.SERVICE_B_URL || "http://localhost:3001";

// Màu sắc cho terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  title: (text) =>
    console.log(`\n${colors.bright}${colors.cyan}╔ ${text} ╚${colors.reset}\n`),
  section: (text) => console.log(`${colors.blue}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.cyan}ℹ ${text}${colors.reset}`),
  warn: (text) => console.log(`${colors.yellow}⚠ ${text}${colors.reset}`),
};

// ============================================================
// KỊCH BẢN 1: SERVICE B CHẬM (TIMEOUT)
// ============================================================
async function scenario1_SlowService() {
  log.title("KỊCH BẢN 1: Service B Chậm (Timeout)");
  log.section(
    "Mô phỏng: Service B phản hồi chậm\n" +
      "Kỳ vọng:\n" +
      "  - No Protection: Timeout hoặc chờ lâu\n" +
      "  - With Retry: Retry và có thể thành công\n" +
      "  - With All Protections: Circuit Breaker ngắn timeout",
  );

  try {
    // Bước 1: Reset admin stats
    log.section("\n→ Resetting Service B stats...");
    await axios.post(`${SERVICE_B_URL}/admin/reset`);

    // Bước 2: Call Service B với delay để trigger timeout
    log.section(
      "\n→ Calling Service B /api/slow endpoint (5 seconds delay)...",
    );

    // Test without protection
    log.section("\n  [TEST 1] Without Protection:");
    try {
      const startTime = Date.now();
      const response = await axios.get(`${SERVICE_A_URL}/api/no-protection`, {
        timeout: 2000, // 2 seconds timeout
      });
      log.success(`Response: ${response.status} (${Date.now() - startTime}ms)`);
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        log.error(`Timeout sau 2000ms`);
      } else {
        log.error(`Error: ${error.message}`);
      }
    }

    // Test with retry
    log.section("\n  [TEST 2] With Retry (timeout: 1s, max 3 retries):");
    try {
      const startTime = Date.now();
      const response = await axios.get(
        `${SERVICE_A_URL}/api/with-retry?delay=500`,
      );
      log.success(`Success: ${response.status} (${Date.now() - startTime}ms)`);
    } catch (error) {
      log.error(`Failed: ${error.response?.data?.error || error.message}`);
    }
  } catch (error) {
    log.error(`Scenario 1 failed: ${error.message}`);
  }
}

// ============================================================
// KỊCH BẢN 2: SERVICE B LỖI (5xx ERROR)
// ============================================================
async function scenario2_ServiceError() {
  log.title("KỊCH BẢN 2: Service B Lỗi (5xx Error)");
  log.section(
    "Mô phỏng: Service B trả về error 500\n" +
      "Kỳ vọng:\n" +
      "  - No Protection: Fail ngay\n" +
      "  - With Retry: Retry nhiều lần rồi fail\n" +
      "  - With Circuit Breaker: Sau vài lỗi, circuit breaker mở, reject all requests",
  );

  try {
    // Setup Service B để return error
    log.section("\n→ Setting Service B to return errors...");

    // Test without protection
    log.section("\n  [TEST 1] Without Protection (3 requests):");
    for (let i = 0; i < 3; i++) {
      try {
        const response = await axios.get(
          `${SERVICE_A_URL}/api/no-protection?errorRate=100`,
        );
        log.success(`Request ${i + 1}: Success ${response.status}`);
      } catch (error) {
        log.error(
          `Request ${i + 1}: ${error.response?.status || error.message}`,
        );
      }
    }

    // Test with retry
    log.section("\n  [TEST 2] With Retry (3 requests):");
    for (let i = 0; i < 3; i++) {
      try {
        const response = await axios.get(`${SERVICE_A_URL}/api/with-retry`);
        log.success(`Request ${i + 1}: Success`);
      } catch (error) {
        log.error(`Request ${i + 1}: Failed after retries`);
      }
    }

    // Test with circuit breaker - trigger circuit open
    log.section(
      "\n  [TEST 3] With Circuit Breaker (5+ requests to trigger OPEN):",
    );
    let cbStats = null;
    for (let i = 0; i < 6; i++) {
      try {
        const response = await axios.get(
          `${SERVICE_A_URL}/api/with-circuit-breaker`,
        );
        cbStats = response.data.cbStats;
        log.success(
          `Request ${i + 1}: ${response.status} - CB State: ${response.data.cbState}`,
        );
      } catch (error) {
        cbStats = error.response?.data?.cbStats;
        const state = error.response?.data?.cbState;
        log.error(
          `Request ${i + 1}: CB State: ${state} - ${error.response?.data?.error || error.message}`,
        );
      }
    }
    if (cbStats) {
      log.info(
        `Final CB Stats: Failures=${cbStats.failures}, Success Rate=${cbStats.successRate}`,
      );
    }
  } catch (error) {
    log.error(`Scenario 2 failed: ${error.message}`);
  }
}

// ============================================================
// KỊCH BẢN 3: RATE LIMITING
// ============================================================
async function scenario3_RateLimiting() {
  log.title("KỊCH BẢN 3: Rate Limiting");
  log.section(
    "Mô phỏng: Rapid requests vượt quá rate limit\n" +
      "Cấu hình: 5 requests per 10 seconds\n" +
      "Kỳ vọng:\n" +
      "  - Requests 1-5: Success (200)\n" +
      "  - Requests 6+: Rate limit error (429)",
  );

  try {
    // Reset rate limiter
    log.section("\n→ Resetting Rate Limiter...");
    await axios.post(`${SERVICE_A_URL}/admin/rate-limiter/reset`);

    log.section("\n→ Sending 10 rapid requests...");
    const results = { success: 0, rateLimited: 0, errors: 0 };

    for (let i = 1; i <= 10; i++) {
      try {
        const response = await axios.get(
          `${SERVICE_A_URL}/api/with-rate-limiter`,
        );
        results.success++;
        log.success(
          `Request ${i}: Success - Remaining: ${response.data.stats.availableRequests}`,
        );
      } catch (error) {
        if (error.response?.status === 429) {
          results.rateLimited++;
          log.warn(`Request ${i}: Rate Limited (429)`);
        } else {
          results.errors++;
          log.error(
            `Request ${i}: Error ${error.response?.status || error.message}`,
          );
        }
      }

      // No delay - send immediately
    }

    log.section(
      `\n📊 Results: Success=${results.success}, RateLimited=${results.rateLimited}, Errors=${results.errors}`,
    );
  } catch (error) {
    log.error(`Scenario 3 failed: ${error.message}`);
  }
}

// ============================================================
// KỊCH BẢN 4: CONCURRENT REQUESTS (BULKHEAD)
// ============================================================
async function scenario4_BulkheadConcurrency() {
  log.title("KỊCH BẢN 4: Bulkhead - Concurrent Requests");
  log.section(
    "Mô phỏng: 15 concurrent requests với max concurrent = 5\n" +
      "Kỳ vọng:\n" +
      "  - Requests 1-5: Execute immediately\n" +
      "  - Requests 6-15: Queue waiting\n" +
      "  - Monitor active/queued count",
  );

  try {
    // Reset bulkhead
    log.section("\n→ Resetting Bulkhead...");
    await axios.post(`${SERVICE_A_URL}/admin/bulkhead/reset`);

    log.section("\n→ Sending 10 concurrent requests...");

    // Send all requests simultaneously
    const promises = Array.from({ length: 10 }, (_, i) =>
      axios
        .get(`${SERVICE_A_URL}/api/with-bulkhead`)
        .then(() => ({ index: i + 1, success: true }))
        .catch((error) => ({
          index: i + 1,
          success: false,
          error: error.response?.data?.error || error.message,
        })),
    );

    const results = await Promise.allSettled(promises);

    const stats = { successful: 0, failed: 0, queued: 0 };
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        if (data.success) {
          stats.successful++;
          log.success(`Request ${data.index}: Success`);
        } else {
          stats.failed++;
          log.error(`Request ${data.index}: ${data.error}`);
        }
      }
    });

    log.section(
      `\n📊 Results: Successful=${stats.successful}, Failed=${stats.failed}`,
    );
  } catch (error) {
    log.error(`Scenario 4 failed: ${error.message}`);
  }
}

// ============================================================
// KỊCH BẢN 5: SERVICE DOWN (CIRCUIT BREAKER)
// ============================================================
async function scenario5_ServiceDown() {
  log.title("KỊCH BẢN 5: Service Down - Circuit Breaker");
  log.section(
    "Mô phỏng: Service B down hoàn toàn\n" +
      "Kỳ vọng:\n" +
      "  - Requests 1-10: Connection errors, Circuit Breaker opens\n" +
      "  - Requests 11+: Fast fail (Circuit OPEN), no retry",
  );

  try {
    // Bring Service B down
    log.section("\n→ Bringing Service B down...");
    await axios.post(`${SERVICE_B_URL}/admin/health/down`);

    // Reset circuit breaker
    log.section("→ Resetting Circuit Breaker...");
    await axios.post(`${SERVICE_A_URL}/admin/circuit-breaker/reset`);

    log.section("\n→ Sending requests to down service...");

    for (let i = 1; i <= 12; i++) {
      try {
        const response = await axios.get(
          `${SERVICE_A_URL}/api/with-circuit-breaker`,
        );
        log.success(
          `Request ${i}: Success - CB State: ${response.data.cbState}`,
        );
      } catch (error) {
        const cbState = error.response?.data?.cbState;
        const errorMsg = error.response?.data?.error || error.message;

        if (cbState === "OPEN") {
          log.warn(`Request ${i}: CB OPEN - Fast fail (no retry)`);
        } else if (cbState === "HALF_OPEN") {
          log.warn(`Request ${i}: CB HALF_OPEN - Testing recovery`);
        } else {
          log.error(`Request ${i}: ${errorMsg}`);
        }
      }
    }

    // Bring Service B back up
    log.section("\n→ Bringing Service B back up...");
    await axios.post(`${SERVICE_B_URL}/admin/health/up`);

    log.section("→ Waiting for Circuit Breaker to recover...");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for recovery

    log.section("→ Sending requests to recovered service...");
    for (let i = 1; i <= 3; i++) {
      try {
        const response = await axios.get(
          `${SERVICE_A_URL}/api/with-circuit-breaker`,
        );
        log.success(
          `Request ${i}: Success - CB State: ${response.data.cbState}`,
        );
      } catch (error) {
        log.error(
          `Request ${i}: ${error.response?.data?.error || error.message}`,
        );
      }
    }
  } catch (error) {
    log.error(`Scenario 5 failed: ${error.message}`);
  }
}

// ============================================================
// KỊCH BẢN 6: COMPLETE TEST - WITH ALL PROTECTIONS
// ============================================================
async function scenario6_CompleteTest() {
  log.title("KỊCH BẢN 6: Complete Test - With ALL Protections");
  log.section(
    "Mô phỏng: Production-ready requests với tất cả fault tolerance techniques\n" +
      "Các protections: Retry + Circuit Breaker + Rate Limiter + Bulkhead",
  );

  try {
    // Reset all
    log.section("\n→ Resetting all protections...");
    await Promise.all([
      axios.post(`${SERVICE_A_URL}/admin/circuit-breaker/reset`),
      axios.post(`${SERVICE_A_URL}/admin/rate-limiter/reset`),
      axios.post(`${SERVICE_A_URL}/admin/bulkhead/reset`),
      axios.post(`${SERVICE_B_URL}/admin/health/up`),
      axios.post(`${SERVICE_B_URL}/admin/reset`),
    ]);

    log.section("\n→ Sending 5 requests with all protections...");

    for (let i = 1; i <= 5; i++) {
      try {
        const response = await axios.get(
          `${SERVICE_A_URL}/api/with-all-protections`,
        );
        log.success(
          `Request ${i}: Success (${response.data.data.name}) - CB: ${response.data.protections.circuitBreaker.state}`,
        );
      } catch (error) {
        log.error(
          `Request ${i}: ${error.response?.data?.error || error.message}`,
        );
      }
    }

    // Check final stats
    log.section("\n→ Getting final protection stats...");
    const stats = await axios.get(`${SERVICE_A_URL}/admin/stats`);
    log.info(`\n📊 Final Stats:\n${JSON.stringify(stats.data, null, 2)}`);
  } catch (error) {
    log.error(`Scenario 6 failed: ${error.message}`);
  }
}

// ============================================================
// RUN ALL SCENARIOS
// ============================================================
async function runAllScenarios() {
  log.title("FAULT TOLERANCE TEST SCENARIOS");
  log.section("Starting all test scenarios...\n");

  try {
    // Check if services are running
    log.section("Checking if services are running...");
    try {
      await axios.get(`${SERVICE_A_URL}/api/health`);
      log.success(`Service A is running at ${SERVICE_A_URL}`);
    } catch {
      log.error(`Service A is not running at ${SERVICE_A_URL}`);
      process.exit(1);
    }

    try {
      await axios.get(`${SERVICE_B_URL}/api/health`);
      log.success(`Service B is running at ${SERVICE_B_URL}`);
    } catch {
      log.error(`Service B is not running at ${SERVICE_B_URL}`);
      process.exit(1);
    }

    // Run scenarios
    await scenario1_SlowService();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await scenario2_ServiceError();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await scenario3_RateLimiting();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await scenario4_BulkheadConcurrency();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await scenario5_ServiceDown();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await scenario6_CompleteTest();

    log.title("ALL TESTS COMPLETED ✓");
  } catch (error) {
    log.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllScenarios().catch((error) => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  scenario1_SlowService,
  scenario2_ServiceError,
  scenario3_RateLimiting,
  scenario4_BulkheadConcurrency,
  scenario5_ServiceDown,
  scenario6_CompleteTest,
};
