/**
 * GraphQL Client - Test queries
 * Example queries to test GraphQL API
 */

const http = require("http");

const BASE_URL = "http://localhost:4000/graphql";

// ============================================
// GRAPHQL QUERIES & MUTATIONS
// ============================================

const queries = {
  // Query 1: Get user with only name and email (no over-fetching)
  getUser: `
    query {
      user(id: 1) {
        name
        email
      }
    }
  `,

  // Query 2: Get user with nested posts (no under-fetching)
  getUserWithPosts: `
    query {
      user(id: 1) {
        id
        name
        email
        posts {
          id
          title
          content
        }
      }
    }
  `,

  // Query 3: Get all users
  getAllUsers: `
    query {
      users {
        id
        name
        email
      }
    }
  `,

  // Query 4: Get all posts with author
  getAllPostsWithAuthor: `
    query {
      posts {
        id
        title
        content
        author {
          name
          email
        }
      }
    }
  `,

  // Mutation 1: Create user
  createUser: `
    mutation {
      createUser(name: "Charlie", email: "charlie@example.com") {
        id
        name
        email
      }
    }
  `,

  // Mutation 2: Create post
  createPost: `
    mutation {
      createPost(userId: 1, title: "GraphQL Post", content: "Testing GraphQL") {
        id
        title
        content
        author {
          name
        }
      }
    }
  `,

  // Mutation 3: Update user
  updateUser: `
    mutation {
      updateUser(id: 1, name: "Alice Updated") {
        id
        name
        email
      }
    }
  `,

  // Mutation 4: Delete user
  deleteUser: `
    mutation {
      deleteUser(id: 3)
    }
  `,
};

// ============================================
// REQUEST FUNCTION
// ============================================

function sendQuery(query, operationName = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query });

    const options = {
      hostname: "localhost",
      port: 4000,
      path: "/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: body });
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ============================================
// TEST SUITE
// ============================================

async function runTests() {
  console.log("=".repeat(60));
  console.log("GraphQL Client Test Suite");
  console.log("=".repeat(60));

  try {
    // Test 1
    console.log("\n[Test 1] Query: Get user (only name and email)");
    let result = await sendQuery(queries.getUser);
    console.log("Response:", JSON.stringify(result, null, 2));

    // Test 2
    console.log("\n[Test 2] Query: Get user with posts");
    result = await sendQuery(queries.getUserWithPosts);
    console.log("Response:", JSON.stringify(result, null, 2));

    // Test 3
    console.log("\n[Test 3] Query: Get all users");
    result = await sendQuery(queries.getAllUsers);
    console.log("Response:", JSON.stringify(result, null, 2));

    // Test 4
    console.log("\n[Test 4] Query: Get all posts with author");
    result = await sendQuery(queries.getAllPostsWithAuthor);
    console.log("Response:", JSON.stringify(result, null, 2));

    // Test 5
    console.log("\n[Test 5] Mutation: Create user");
    result = await sendQuery(queries.createUser);
    console.log("Response:", JSON.stringify(result, null, 2));

    // Test 6
    console.log("\n[Test 6] Mutation: Create post");
    result = await sendQuery(queries.createPost);
    console.log("Response:", JSON.stringify(result, null, 2));

    // Test 7
    console.log("\n[Test 7] Mutation: Update user");
    result = await sendQuery(queries.updateUser);
    console.log("Response:", JSON.stringify(result, null, 2));

    console.log("\n✓ All tests completed");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(runTests, 1000);
