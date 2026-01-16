// testAPI.js - Test các endpoint của Resource Server
const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3002";

async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("Request error:", error.message);
    return null;
  }
}

async function runTests() {
  console.log("🧪 === Testing OAuth2 Resource Server ===\n");

  // ===== Test 1: Login as User =====
  console.log("📌 Test 1: Login as User");
  let result = await makeRequest("POST", "/auth/login", {
    username: "user",
    password: "user123",
  });
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  const userAccessToken = result.data.accessToken;
  const userRefreshToken = result.data.refreshToken;
  console.log("");

  // ===== Test 2: Login as Admin =====
  console.log("📌 Test 2: Login as Admin");
  result = await makeRequest("POST", "/auth/login", {
    username: "admin",
    password: "admin123",
  });
  console.log("Status:", result.status);
  const adminAccessToken = result.data.accessToken;
  console.log("Access Token acquired ✅\n");

  // ===== Test 3: Access Protected Resource (With Token) =====
  console.log("📌 Test 3: Get Profile (With Valid Token)");
  result = await makeRequest("GET", "/api/profile", null, userAccessToken);
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  // ===== Test 4: Access Protected Resource (Without Token) =====
  console.log("📌 Test 4: Get Profile (Without Token)");
  result = await makeRequest("GET", "/api/profile");
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  // ===== Test 5: Get Products =====
  console.log("📌 Test 5: Get Products (With Valid Token)");
  result = await makeRequest("GET", "/api/products", null, userAccessToken);
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  // ===== Test 6: Admin Operation - User Forbidden =====
  console.log("📌 Test 6: Create User (User Trying - Should Fail)");
  result = await makeRequest(
    "POST",
    "/api/admin/users",
    { username: "newuser", password: "pass123", role: "user" },
    userAccessToken
  );
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  // ===== Test 7: Admin Operation - Admin Allowed =====
  console.log("📌 Test 7: Create User (Admin - Should Succeed)");
  result = await makeRequest(
    "POST",
    "/api/admin/users",
    { username: "newuser", password: "pass123", role: "user" },
    adminAccessToken
  );
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  // ===== Test 8: Refresh Token =====
  console.log("📌 Test 8: Refresh Access Token");
  result = await makeRequest("POST", "/auth/refresh", {
    refreshToken: userRefreshToken,
  });
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  // ===== Test 9: Logout =====
  console.log("📌 Test 9: Logout");
  result = await makeRequest("POST", "/auth/logout", {
    refreshToken: userRefreshToken,
  });
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  // ===== Test 10: Try Refresh After Logout =====
  console.log("📌 Test 10: Try Refresh After Logout (Should Fail)");
  result = await makeRequest("POST", "/auth/refresh", {
    refreshToken: userRefreshToken,
  });
  console.log("Status:", result.status);
  console.log("Response:", JSON.stringify(result.data, null, 2));
  console.log("");

  console.log("✅ All tests completed!");
  process.exit(0);
}

// Chạy tests sau 2 giây (đảm bảo server đã khởi động)
setTimeout(runTests, 2000);
