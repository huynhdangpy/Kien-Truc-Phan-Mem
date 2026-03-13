/**
 * gRPC Client - Test gRPC Server
 * Make RPC calls to gRPC server
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load proto
const PROTO_PATH = path.join(__dirname, "api.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const api = grpc.loadPackageDefinition(packageDefinition).api;

// Create client
const client = new api.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure(),
);

// ============================================
// TEST FUNCTIONS
// ============================================

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function testGetUser() {
  return new Promise((resolve) => {
    console.log("\n[Test 1] GetUser (Unary RPC)");
    client.getUser({ id: 1 }, (err, response) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.log("Response:", response);
      }
      resolve();
    });
  });
}

function testCreateUser() {
  return new Promise((resolve) => {
    console.log("\n[Test 2] CreateUser (Unary RPC)");
    client.createUser(
      { name: "Charlie", email: "charlie@example.com" },
      (err, response) => {
        if (err) {
          console.error("Error:", err.message);
        } else {
          console.log("Response:", response);
        }
        resolve();
      },
    );
  });
}

function testListUsers() {
  return new Promise((resolve) => {
    console.log("\n[Test 3] ListUsers (Unary RPC)");
    client.listUsers({}, (err, response) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.log(`Total users: ${response.users.length}`);
        console.log("Users:", response.users);
      }
      resolve();
    });
  });
}

function testCreatePost() {
  return new Promise((resolve) => {
    console.log("\n[Test 4] CreatePost (Unary RPC)");
    client.createPost(
      { userId: 1, title: "New gRPC Post", content: "Testing streaming" },
      (err, response) => {
        if (err) {
          console.error("Error:", err.message);
        } else {
          console.log("Response:", response);
        }
        resolve();
      },
    );
  });
}

function testStreamUserPosts() {
  return new Promise((resolve) => {
    console.log("\n[Test 5] StreamUserPosts (Server Streaming RPC)");
    const call = client.streamUserPosts({ userId: 1 });

    let postCount = 0;

    call.on("data", (post) => {
      postCount++;
      console.log(`Received post ${postCount}:`, post);
    });

    call.on("end", () => {
      console.log(`Total posts received: ${postCount}`);
      resolve();
    });

    call.on("error", (err) => {
      console.error("Stream error:", err);
      resolve();
    });
  });
}

// ============================================
// RUN TESTS
// ============================================

async function runAllTests() {
  console.log("=".repeat(60));
  console.log("gRPC Client Test Suite");
  console.log("=".repeat(60));

  try {
    await testGetUser();
    await sleep(500);

    await testCreateUser();
    await sleep(500);

    await testListUsers();
    await sleep(500);

    await testCreatePost();
    await sleep(500);

    await testStreamUserPosts();
    await sleep(500);

    console.log("\n✓ All tests completed");
    process.exit(0);
  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
}

// Start tests after a delay to ensure server is ready
setTimeout(runAllTests, 1000);
