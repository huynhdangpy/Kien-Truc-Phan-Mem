/**
 * gRPC Server Implementation
 * Node.js + gRPC + Protocol Buffers
 *
 * Khái niệm: gRPC (gRPC Remote Procedure Call)
 * - HTTP/2 multiplexing
 * - Binary protocol (Protobuf)
 * - Bidirectional streaming
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load Protocol Buffer definition
const PROTO_PATH = path.join(__dirname, "api.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const api = grpc.loadPackageDefinition(packageDefinition).api;

// ============================================
// IN-MEMORY DATA
// ============================================

let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

let posts = [
  { id: 1, userId: 1, title: "First Post", content: "Hello gRPC" },
  { id: 2, userId: 1, title: "Second Post", content: "Binary Protocol" },
  { id: 3, userId: 2, title: "Bob's Post", content: "gRPC is fast" },
];

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

const userServiceImpl = {
  /**
   * Unary RPC: Get single user
   */
  getUser: (call, callback) => {
    console.log(`[gRPC] GetUser called with id=${call.request.id}`);
    const user = users.find((u) => u.id === call.request.id);

    if (user) {
      callback(null, { user });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: `User with id ${call.request.id} not found`,
      });
    }
  },

  /**
   * Unary RPC: Create user
   */
  createUser: (call, callback) => {
    console.log(`[gRPC] CreateUser called with name=${call.request.name}`);
    const { name, email } = call.request;

    const newUser = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name,
      email,
    };

    users.push(newUser);
    callback(null, { user: newUser });
  },

  /**
   * Unary RPC: List all users
   */
  listUsers: (call, callback) => {
    console.log("[gRPC] ListUsers called");
    callback(null, { users });
  },

  /**
   * Unary RPC: Create post
   */
  createPost: (call, callback) => {
    console.log(`[gRPC] CreatePost called with userId=${call.request.userId}`);
    const { userId, title, content } = call.request;

    const newPost = {
      id: Math.max(...posts.map((p) => p.id), 0) + 1,
      userId,
      title,
      content,
    };

    posts.push(newPost);
    callback(null, { post: newPost });
  },

  /**
   * Server Streaming RPC: Stream user posts
   * Client makes one request, server sends multiple responses
   */
  streamUserPosts: (call) => {
    console.log(
      `[gRPC] StreamUserPosts called with userId=${call.request.userId}`,
    );
    const userPosts = posts.filter((p) => p.userId === call.request.userId);

    userPosts.forEach((post) => {
      call.write(post);
    });

    call.end();
  },
};

// ============================================
// CREATE AND START SERVER
// ============================================

function startServer() {
  const server = new grpc.Server();

  // Add service
  server.addService(api.UserService.service, userServiceImpl);

  const PORT = 50051;
  const bindAddress = `0.0.0.0:${PORT}`;

  server.bindAsync(
    bindAddress,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind:", err);
        return;
      }

      server.start();
      console.log("╔══════════════════════════════════════════════════╗");
      console.log(`║ gRPC Server running at ${bindAddress}${" ".repeat(23)}║`);
      console.log("║                                                  ║");
      console.log("║ Proto: api.proto                                 ║");
      console.log("║ Service: UserService                             ║");
      console.log("║ Methods: GetUser, CreateUser, ListUsers, etc     ║");
      console.log("╚══════════════════════════════════════════════════╝");
    },
  );
}

startServer();
