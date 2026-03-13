// Test REST API
const http = require("http");

const BASE_URL = "http://localhost:3000/api";

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("REST API Test Suite");
  console.log("=".repeat(60));

  try {
    // 1. Get all users
    console.log("\n1. GET /api/users");
    let res = await request("GET", "/users");
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));

    // 2. Create a user
    console.log("\n2. POST /api/users");
    res = await request("POST", "/users", {
      name: "Charlie",
      email: "charlie@example.com",
    });
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));

    // 3. Get specific user
    console.log("\n3. GET /api/users/1");
    res = await request("GET", "/users/1");
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));

    // 4. Update user
    console.log("\n4. PUT /api/users/1");
    res = await request("PUT", "/users/1", {
      name: "Alice Updated",
    });
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));

    // 5. Get all posts
    console.log("\n5. GET /api/posts");
    res = await request("GET", "/posts");
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));

    // 6. Create a post
    console.log("\n6. POST /api/posts");
    res = await request("POST", "/posts", {
      userId: 1,
      title: "New Post",
      content: "Testing REST API",
    });
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));

    // 7. Get user's posts
    console.log("\n7. GET /api/users/1/posts");
    res = await request("GET", "/users/1/posts");
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));

    // 8. Delete a post
    console.log("\n8. DELETE /api/posts/1");
    res = await request("DELETE", "/posts/1");
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

// Wait for server to start
setTimeout(runTests, 1000);
