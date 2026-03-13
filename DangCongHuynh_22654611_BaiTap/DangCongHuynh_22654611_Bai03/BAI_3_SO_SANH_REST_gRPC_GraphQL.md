# BÀI 3: SO SÁNH REST, gRPC VÀ GraphQL

## Xây dựng Hệ thống Backend Hiện Đại

**Tác giả:** Đặng Công Huynh (22654611)

---

## MỤC LỤC

1. [Khái Niệm](#khái-niệm)
2. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)
3. [So Sánh Chi Tiết](#so-sánh-chi-tiết)
4. [Phân Tích Chuyên Sâu](#phân-tích-chuyên-sâu)
5. [Kết Luận & Đề Xuất](#kết-luận--đề-xuất)

---

## KHÁI NIỆM

### 1. REST (Representational State Transfer)

**Định nghĩa:**  
REST là một kiến trúc phần mềm được xây dựng dựa trên các nguyên tắc của giao thức HTTP. Nó sử dụng HTTP methods (GET, POST, PUT, DELETE) để thực hiện các phép toán trên tài nguyên được biểu diễn dưới dạng URL.

**Đặc điểm chính:**

- Dựa trên HTTP verbs: GET (lấy), POST (tạo), PUT (cập nhật), DELETE (xóa)
- Tài nguyên được xác định bằng URL paths
- Định dạng dữ liệu: JSON, XML, hoặc plaintext
- Stateless: mỗi request độc lập và chứa toàn bộ thông tin cần thiết
- Easy to understand và widely adopted

**Ưu điểm:**

```
✓ Dễ hiểu và dễ học
✓ Hỗ trợ tốt trên browser và tools (Postman, cURL)
✓ Caching dễ dàng (HTTP caching)
✓ Scalable và simple
✓ Phù hợp với web apps truyền thống
```

**Nhược điểm:**

```
✗ Over-fetching: lấy dữ liệu không cần thiết
✗ Under-fetching: cần nhiều requests để lấy đủ dữ liệu
✗ Versioning API khó quản lý
✗ Thiếu tính linh hoạt
✗ Không tối ưu cho mobile (dữ liệu thừa tải)
```

---

### 2. gRPC (gRPC Remote Procedure Call)

**Định nghĩa:**  
gRPC là framework hiện đại dựa trên HTTP/2 cho việc gọi hàm từ xa (RPC). Nó sử dụng Protocol Buffers (protobuf) để serialize dữ liệu và hỗ trợ bidirectional streaming.

**Đặc điểm chính:**

- Dựa trên HTTP/2 multiplexing
- Định dạng dữ liệu: Protocol Buffers (binary format)
- Hỗ trợ 4 loại streaming: unary, server streaming, client streaming, bidirectional
- Schema-first (phải định nghĩa .proto trước)
- Hiệu năng cao, độ trễ thấp

**Ưu điểm:**

```
✓ Hiệu năng rất cao (binary protocol)
✓ Hỗ trợ real-time streaming tốt
✓ Định dạng nhỏ gọn (tiết kiệm bandwidth)
✓ Type-safe (Protocol Buffers)
✓ Tuyệt vời cho microservices và hệ thống nội bộ
✓ Multiplexing: nhiều requests trong 1 connection
```

**Nhược điểm:**

```
✗ Không hỗ trợ browser trực tiếp
✗ Khó debug (binary format)
✗ Yêu cầu học Protocol Buffers
✗ Ecosystem nhỏ hơn REST
✗ Cần gRPC-web wrapper cho browser
✗ Độ dốc học tập cao
```

---

### 3. GraphQL (Query Language)

**Định nghĩa:**  
GraphQL là ngôn ngữ truy vấn cho APIs, cho phép client yêu cầu chính xác những dữ liệu họ cần. Server định nghĩa một schema, client gửi queries để lấy dữ liệu.

**Đặc điểm chính:**

- Ngôn ngữ truy vấn, không phải giao thức
- Một endpoint duy nhất: POST /graphql
- Định dạng dữ liệu: JSON
- Client-driven: client yêu cầu cái gì, server trả về cái đó
- Strong typing (schema)

**Ưu điểm:**

```
✓ Lấy chính xác dữ liệu cần thiết (no over/under-fetching)
✓ Type system mạnh mẽ
✓ Single endpoint: dễ quản lý
✓ Tuyệt vời cho mobile (bandwidth tối ưu)
✓ Introspection: tự động generate documentation
✓ Dễ versioning (không cần API versioning)
```

**Nhược điểm:**

```
✗ Phức tạp hơn để học
✗ Performance: có thể chậm nếu queries phức tạp
✗ Caching khó hơn (POST-based, không HTTP caching)
✗ Requires strong backend architecture
✗ N+1 query problem
✗ Memory consumption có thể cao
```

---

## VÍ DỤ THỰC TẾ

### 1. REST API - NodeJS + Express

**Kịch bản:** Xây dựng API quản lý người dùng (Users) và bài viết (Posts)

**Cấu trúc:**

```
REST-API/
├── server.js              # Main application
├── routes/
│   ├── users.js          # Users endpoints
│   └── posts.js          # Posts endpoints
├── models/
│   ├── User.js           # User model
│   └── Post.js           # Post model
├── package.json          # Dependencies
└── README.md
```

**File: server.js**

```javascript
const express = require("express");
const app = express();
app.use(express.json());

// In-memory data (in production use database)
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

let posts = [
  { id: 1, userId: 1, title: "First Post", content: "Hello World" },
  { id: 2, userId: 1, title: "Second Post", content: "GraphQL is cool" },
];

// ===== USERS ENDPOINTS =====

// GET /users - Retrieve all users
app.get("/users", (req, res) => {
  res.json(users);
});

// GET /users/:id - Retrieve single user
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// POST /users - Create new user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email" });
  }
  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT /users/:id - Update user
app.put("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });

  Object.assign(user, req.body);
  res.json(user);
});

// DELETE /users/:id - Delete user
app.delete("/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "User not found" });

  const deleted = users.splice(index, 1);
  res.json({ message: "User deleted", user: deleted[0] });
});

// ===== POSTS ENDPOINTS =====

// GET /posts - Retrieve all posts
app.get("/posts", (req, res) => {
  res.json(posts);
});

// GET /posts/:id - Retrieve single post
app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// GET /users/:userId/posts - Get posts of a user
app.get("/users/:userId/posts", (req, res) => {
  const userPosts = posts.filter(
    (p) => p.userId === parseInt(req.params.userId),
  );
  res.json(userPosts);
});

// POST /posts - Create new post
app.post("/posts", (req, res) => {
  const { userId, title, content } = req.body;
  if (!userId || !title || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newPost = { id: posts.length + 1, userId, title, content };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// PUT /posts/:id - Update post
app.put("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });

  Object.assign(post, req.body);
  res.json(post);
});

// DELETE /posts/:id - Delete post
app.delete("/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Post not found" });

  const deleted = posts.splice(index, 1);
  res.json({ message: "Post deleted", post: deleted[0] });
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`REST API running at http://localhost:${PORT}`);
});
```

**Requests Examples (cURL):**

```bash
# Get all users
curl http://localhost:3000/users

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com"}'

# Get user posts
curl http://localhost:3000/users/1/posts

# Problem: Over-fetching - lấy toàn bộ user object khi chỉ cần name
curl http://localhost:3000/users/1
# Response: {"id":1,"name":"Alice","email":"alice@example.com"}
# Chỉ cần: {"name":"Alice"}

# Problem: Under-fetching - cần 2 requests để lấy user + posts
curl http://localhost:3000/users/1
curl http://localhost:3000/users/1/posts
```

**package.json:**

```json
{
  "name": "rest-api-example",
  "version": "1.0.0",
  "description": "REST API example with Node.js and Express",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

### 2. gRPC API - NodeJS + Protocol Buffers

**Kịch bản:** Cùng dữ liệu (Users + Posts) nhưng dùng gRPC

**Cấu trúc:**

```
gRPC-API/
├── server.js            # gRPC server
├── client.js            # gRPC client (for testing)
├── proto/
│   └── api.proto        # Protocol Buffer definitions
├── package.json
└── README.md
```

**File: proto/api.proto**

```protobuf
syntax = "proto3";

package api;

// Message definitions
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

message Post {
  int32 id = 1;
  int32 userId = 2;
  string title = 3;
  string content = 4;
}

message GetUserRequest {
  int32 id = 1;
}

message GetUserResponse {
  User user = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message CreateUserResponse {
  User user = 1;
}

message ListUsersRequest {}

message ListUsersResponse {
  repeated User users = 1;
}

message GetUserPostsRequest {
  int32 userId = 1;
}

message GetUserPostsResponse {
  repeated Post posts = 1;
}

// Service definition
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc StreamUserPosts(GetUserPostsRequest) returns (stream Post);
}
```

**File: server.js**

```javascript
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load proto file
const PROTO_PATH = path.join(__dirname, "proto", "api.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const api = grpc.loadPackageDefinition(packageDefinition).api;

// In-memory data
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

let posts = [
  { id: 1, userId: 1, title: "First Post", content: "Hello gRPC" },
  { id: 2, userId: 1, title: "Second Post", content: "Binary protocol" },
];

// Service implementations
const userServiceImpl = {
  getUser: (call, callback) => {
    const user = users.find((u) => u.id === call.request.id);
    if (user) {
      callback(null, { user });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    }
  },

  createUser: (call, callback) => {
    const { name, email } = call.request;
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    callback(null, { user: newUser });
  },

  listUsers: (call, callback) => {
    callback(null, { users });
  },

  streamUserPosts: (call) => {
    const userPosts = posts.filter((p) => p.userId === call.request.userId);
    userPosts.forEach((post) => {
      call.write(post);
    });
    call.end();
  },
};

// Create and start server
const server = new grpc.Server();
server.addService(api.UserService.service, userServiceImpl);

const PORT = 50051;
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) throw err;
    console.log(`gRPC server running at 0.0.0.0:${PORT}`);
    server.start();
  },
);
```

**File: client.js**

```javascript
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load proto
const PROTO_PATH = path.join(__dirname, "proto", "api.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const api = grpc.loadPackageDefinition(packageDefinition).api;

// Create client
const client = new api.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure(),
);

// Test unary RPC
client.getUser({ id: 1 }, (err, response) => {
  if (err) console.error(err);
  else console.log("GetUser response:", response);
});

// Test create
client.createUser(
  { name: "Charlie", email: "charlie@example.com" },
  (err, response) => {
    if (err) console.error(err);
    else console.log("CreateUser response:", response);
  },
);

// Test server streaming
const call = client.streamUserPosts({ userId: 1 });
call.on("data", (post) => {
  console.log("Received post:", post);
});
call.on("end", () => {
  console.log("Stream ended");
});
```

**package.json:**

```json
{
  "name": "grpc-api-example",
  "version": "1.0.0",
  "description": "gRPC API example with Protocol Buffers",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "client": "node client.js"
  },
  "dependencies": {
    "@grpc/grpc-js": "^1.10.0",
    "@grpc/proto-loader": "^0.7.10"
  }
}
```

---

### 3. GraphQL API - NodeJS + Apollo Server

**Kịch bản:** Cùng dữ liệu nhưng dùng GraphQL

**Cấu trúc:**

```
GraphQL-API/
├── server.js            # Apollo Server
├── client.js            # Test client
├── package.json
└── README.md
```

**File: server.js**

```javascript
const { ApolloServer, gql } = require("apollo-server");

// In-memory data
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

let posts = [
  { id: 1, userId: 1, title: "First Post", content: "Hello GraphQL" },
  { id: 2, userId: 1, title: "Second Post", content: "Query optimization" },
];

// GraphQL Schema
const typeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: Int!
    userId: Int!
    title: String!
    content: String!
    author: User!
  }

  type Query {
    user(id: Int!): User
    users: [User!]!
    post(id: Int!): Post
    posts: [Post!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    createPost(userId: Int!, title: String!, content: String!): Post!
    updateUser(id: Int!, name: String, email: String): User
    deleteUser(id: Int!): Boolean!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => users.find((u) => u.id === id),
    users: () => users,
    post: (_, { id }) => posts.find((p) => p.id === id),
    posts: () => posts,
  },

  Mutation: {
    createUser: (_, { name, email }) => {
      const newUser = { id: users.length + 1, name, email };
      users.push(newUser);
      return newUser;
    },

    createPost: (_, { userId, title, content }) => {
      const newPost = { id: posts.length + 1, userId, title, content };
      posts.push(newPost);
      return newPost;
    },

    updateUser: (_, { id, name, email }) => {
      const user = users.find((u) => u.id === id);
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
      }
      return user;
    },

    deleteUser: (_, { id }) => {
      const index = users.findIndex((u) => u.id === id);
      if (index > -1) {
        users.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  User: {
    posts: (user) => posts.filter((p) => p.userId === user.id),
  },

  Post: {
    author: (post) => users.find((u) => u.id === post.userId),
  },
};

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start server
server.listen({ port: 4000 }, () => {
  console.log("GraphQL server running at http://localhost:4000");
});
```

**Query Examples:**

```graphql
# Query 1: Get only needed fields (no over-fetching)
query {
  user(id: 1) {
    name
    email
  }
}

# Query 2: Get user with posts in one request (no under-fetching)
query {
  user(id: 1) {
    id
    name
    posts {
      id
      title
    }
  }
}

# Query 3: Get posts with author details
query {
  posts {
    title
    content
    author {
      name
      email
    }
  }
}

# Mutation: Create a new user
mutation {
  createUser(name: "David", email: "david@example.com") {
    id
    name
    email
  }
}
```

**package.json:**

```json
{
  "name": "graphql-api-example",
  "version": "1.0.0",
  "description": "GraphQL API example with Apollo Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "apollo-server": "^4.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## SO SÁNH CHI TIẾT

| **Tiêu Chí**             | **REST**                     | **gRPC**                  | **GraphQL**                  |
| ------------------------ | ---------------------------- | ------------------------- | ---------------------------- |
| **Giao Thức**            | HTTP/1.1                     | HTTP/2                    | HTTP/1.1 hoặc HTTP/2         |
| **Định Dạng Dữ Liệu**    | JSON, XML                    | Protocol Buffers (binary) | JSON                         |
| **Phương Thức Truy Vấn** | Multiple URLs + HTTP methods | Method calls              | Single endpoint + queries    |
| **Caching**              | HTTP caching (dễ)            | Caching khó hơn           | POST-based, caching khó      |
| **Hiệu Năng**            | Trung bình                   | Rất cao                   | Trung bình                   |
| **Độ Trễ**               | ~50-100ms                    | ~5-10ms                   | ~50-100ms (tùy query)        |
| **Payload Size**         | ~1-3KB (JSON)                | ~100-500B (binary)        | ~1-3KB (JSON)                |
| **Browser Support**      | ✅ Gốc                       | ❌ Cần gRPC-web           | ✅ Gốc (Apollo Client)       |
| **Real-time Streaming**  | ❌ (WebSocket)               | ✅ Bidirectional          | ✅ (WebSocket subscriptions) |
| **Learning Curve**       | ⭐ (Dễ)                      | ⭐⭐⭐ (Khó)              | ⭐⭐ (Trung bình)            |
| **Type Safety**          | ❌ (No schema validation)    | ✅ (Protocol Buffers)     | ✅ (GraphQL schema)          |
| **Over-fetching**        | ❌ (Vấn đề)                  | N/A                       | ✅ (Được giải quyết)         |
| **Under-fetching**       | ❌ (Vấn đề)                  | N/A                       | ✅ (Được giải quyết)         |
| **Versioning**           | ❌ (Cần versioning)          | ✅ (Backward compatible)  | ✅ (Không cần versioning)    |
| **Scalability**          | ✅ Tốt                       | ✅✅ Rất tốt              | ✅ Tốt                       |
| **Community**            | ✅✅✅ Rất lớn               | ✅ Đang phát triển        | ✅✅ Lớn                     |
| **Suitable For**         | Web APIs, Public APIs        | Microservices, Internal   | Mobile, Complex queries      |

---

## PHÂN TÍCH CHUYÊN SÂU

### 1. REST Chạy Tốt Nhất Khi?

**Trường hợp sử dụng tối ưu:**

1. **Public APIs & Web Services**
   - Facebook API, GitHub API, Twitter API
   - Dễ hiểu, không yêu cầu client library đặc biệt
   - Browser & cURL có thể sử dụng trực tiếp

2. **CRUD Operations Đơn Giản**
   - Simple database operations
   - One-to-one resource mapping
   - Không cần complex nested data

3. **HTTP Caching Quan Trọng**
   - CDN caching (Cloudflare, AWS CloudFront)
   - Client-side caching
   - Static resources

4. **Stateless Services**
   - Mỗi request độc lập
   - Easy horizontal scaling
   - Load balancing đơn giản

**Ví dụ thực tế:**

```
REST phù hợp cho:
- Blog API (get posts, create posts, etc.)
- E-commerce product listing
- Weather API (GET /weather?city=hanoi)
- Static content delivery
```

---

### 2. gRPC Vượt Trội Khi?

**Trường hợp sử dụng tối ưu:**

1. **Microservices Communication**
   - Service-to-service communication
   - Netflix, Google, Uber sử dụng gRPC nội bộ
   - Performance critical
   - Latency-sensitive: <10ms

2. **Real-time Streaming Data**

   ```
   - IoT sensors (millions of data points)
   - Trading platforms (real-time prices)
   - Live gaming (position updates)
   - Media streaming (video/audio)
   ```

3. **High-Performance Systems**
   - Binary format: 10x nhỏ hơn JSON
   - Multiplexing: multiple streams in one connection
   - CPU efficient
   - Bandwidth optimized

4. **Internal Company Infrastructure**
   - Not public-facing
   - Team knows gRPC
   - Performance > Developer experience

**Ví dụ kiến trúc gRPC:**

```
┌─────────────────────────────────┐
│   API Gateway (REST)            │
│  Converts REST → gRPC           │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼───┐         ┌──▼────┐
│User   │         │Post   │
│Service│         │Service│
│(gRPC) │         │(gRPC) │
└───┬───┘         └──┬────┘
    │                │
┌───▼────────────────▼────┐
│   Shared DB / Cache     │
└─────────────────────────┘
```

---

### 3. Khi Nào Dùng GraphQL Thay Vì REST?

**Các vấn đề mà GraphQL giải quyết:**

1. **Over-fetching Problem**

   ```
   REST Example:
   GET /users/1
   Response: {
     id: 1, name: "Alice", email: "alice@example.com",
     phone: "123456", address: "...", created_at: "..."
   }
   # Chỉ cần name nhưng lấy cả object

   GraphQL Solution:
   query { user(id: 1) { name } }
   Response: { user: { name: "Alice" } }
   # Chỉ lấy cái cần
   ```

2. **Under-fetching Problem**

   ```
   REST Example:
   GET /users/1               # Request 1
   GET /users/1/posts         # Request 2
   GET /posts/1/comments      # Request 3
   # Cần 3 requests

   GraphQL Solution:
   query {
     user(id: 1) {
       name
       posts {
         title
         comments { text }
       }
     }
   }
   # 1 request, toàn bộ data
   ```

3. **Mobile Apps - Bandwidth Optimization**
   - 5G, 4G, 3G networks
   - Data-heavy regions (Southeast Asia)
   - Expensive data plans
   - GraphQL giảm payload 30-50%

4. **Complex Nested Data**
   - Social media (user → posts → comments → likes)
   - E-commerce (product → reviews → ratings)
   - CMS (articles → categories → tags)

5. **Rapid Frontend Development**
   - Schema introspection: auto-generate client types
   - Strong typing: catch errors at compile time
   - No API versioning needed

**Case Study: GitHub & Shopify**

```
Both migrated from REST → GraphQL:
- GitHub: GraphQL API v4 (2016)
- Shopify: GraphQL Admin API (2017)

Reasons:
✓ Mobile performance
✓ Complex nested data
✓ Faster frontend development
✓ Better developer experience
```

---

## KIẾN TRÚC & PATTERN COMPARISON

### Pattern 1: API Gateway Architecture

```
┌─────────────────────────────────┐
│   Clients (Web, Mobile, etc)    │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   API Gateway                   │
│  - Routing                      │
│  - Rate limiting                │
│  - Authentication               │
└───┬──────────┬──────────┬───────┘
    │          │          │
 REST      GraphQL      gRPC
    │          │          │
┌───▼──┐  ┌───▼──┐  ┌───▼──┐
│Svc 1 │  │Svc 2 │  │Svc 3 │
└──────┘  └──────┘  └──────┘
```

**REST API Gateway:**

- Stateless, horizontal scaling
- HTTP caching friendly
- Public APIs

**GraphQL Gateway:**

- Single endpoint
- Schema stitching for multiple services
- Better for complex queries

**gRPC Gateway:**

- High-performance proxy
- Binary protocol
- Internal microservices

---

### Pattern 2: Hybrid Approach

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTP/HTTPS
    ┌────▼─────────┐
    │ REST API     │ ← Simple, cacheable
    │ /api/v1/...  │
    └────┬─────────┘
         │
    ┌────▼─────────┐
    │   Service A  │
    └──────────────┘

┌──────────────────┐
│  Mobile App      │
└────────┬─────────┘
         │ HTTP/2
    ┌────▼──────────┐
    │ GraphQL       │ ← Bandwidth optimized
    │ /graphql      │
    └────┬──────────┘
         │
    ┌────▼─────────┐
    │   Service B  │
    └──────────────┘

┌──────────────────┐
│ Microservice A   │
└────────┬─────────┘
         │ gRPC
    ┌────▼──────────┐
    │ Microservice B│ ← High performance
    └──────────────┘
```

---

## BẢNG QUYẾT ĐỊNH CHỌN CÔNG NGHỆ

| **Yêu Cầu**          | **Chọn**                                            | **Lý Do**                                |
| -------------------- | --------------------------------------------------- | ---------------------------------------- |
| Public API           | **REST**                                            | Dễ hiểu, HTTP caching, Browser support   |
| Mobile App           | **GraphQL**                                         | Bandwidth optimization, complex queries  |
| Microservices        | **gRPC**                                            | High performance, low latency, streaming |
| Hệ thống nội bộ      | **gRPC**                                            | Type-safe, schema-driven, performant     |
| Real-time Data       | **gRPC + WebSocket** hoặc **GraphQL Subscriptions** | Bidirectional streaming                  |
| Simple CRUD          | **REST**                                            | KISS principle, easy to learn            |
| Complex Queries      | **GraphQL**                                         | Flexible data fetching                   |
| Bandwidth Critical   | **gRPC**                                            | Binary format, small payload             |
| Developer Experience | **GraphQL**                                         | Schema introspection, strong typing      |

---

## KẾT LUẬN & ĐỀ XUẤT

### 1. Cho Microservices Architecture

**Đề xuất: gRPC (chính) + REST API Gateway**

```
Architecture:
┌──────────────────────────┐
│  Public REST API Gateway │
│  (Giao diện cho clients)  │
└────────────┬─────────────┘
             │
        ┌────┴─────┐
        │           │
    ┌───▼──┐   ┌──▼───┐
    │User  │   │Post  │
    │Svc   │   │Svc   │
    │gRPC  │   │gRPC  │
    └──────┘   └──────┘

Benefits:
✓ gRPC: <10ms latency, binary format
✓ REST: Easy to use for external clients
✓ Best of both worlds
```

**Implementation:**

```javascript
// gRPC services communicate with each other
// REST Gateway exposes to external clients
const grpcUserService = require("./services/user.grpc");
const grpcPostService = require("./services/post.grpc");

app.get("/api/users/:id", async (req, res) => {
  // Call gRPC service internally
  const user = await grpcUserService.getUser(req.params.id);
  res.json(user);
});
```

---

### 2. Cho Mobile Apps

**Đề xuất: GraphQL (chính) + REST Fallback**

```
Lý do:
✓ GraphQL: Bandwidth 30-50% kém hơn REST
✓ Complex queries: 1 request thay vì 3-4 requests
✓ Schema-driven: Auto-generate mobile types
✓ Subscriptions: Real-time notifications
```

**Implementation:**

```javascript
// Mobile client
const query = `
  query {
    user(id: 1) {
      id
      name
      posts {
        title
        createdAt
      }
    }
  }
`;

// Server
const resolvers = {
  User: {
    posts: (user) => db.posts.find({ userId: user.id }),
  },
};
```

---

### 3. Cho Web App Truyền Thống

**Đề xuất: REST (đơn giản) hoặc GraphQL (phức tạp)**

**Simple Web App:**

```
✓ REST: Dễ hiểu, caching tốt, SEO-friendly
- Blog, E-commerce product page
- HTTP caching: Content-Delivery Network
```

**Complex Web App:**

```
✓ GraphQL: Complex queries, real-time updates
- Social media (nested data)
- Dashboard (multiple widgets)
- Real-time collaboration
```

---

### 4. Cho Hệ Thống Nội Bộ Hiệu Năng Cao

**Đề xuất: gRPC + Event-Driven Architecture**

```
Architecture:
┌─────────────────────────────┐
│  High-Performance System    │
└──────────┬──────────────────┘
           │
    ┌──────▼──────┐
    │             │
┌───▼──┐      ┌──▼────┐
│Event │      │ Message│
│Bus   │      │ Queue  │
│      │      │(RabbitMQ)
└──────┘      └────────┘
    │             │
    └──────┬──────┘
           │
    ┌──────▼──────────┐
    │                 │
 ┌──▼───┐       ┌───▼──┐
 │ gRPC │       │ gRPC │
 │Svc A │       │Svc B │
 └──────┘       └──────┘

Benefits:
✓ gRPC: Low latency, high throughput
✓ Event-driven: Decoupled services
✓ Scalable: Horizontal scaling
✓ Resilient: Message queue buffering
```

---

## KHUYẾN NGHỊ CUỐI CÙNG

### Bảng Tóm Tắt Chọn Lựa

| **Loại Hệ Thống**    | **Công Nghệ Chính** | **Công Nghệ Phụ** | **Priority** |
| -------------------- | ------------------- | ----------------- | ------------ |
| **Public REST API**  | REST                | CDN Caching       | Simplicity   |
| **Mobile Backend**   | GraphQL             | REST Fallback     | Bandwidth    |
| **Microservices**    | gRPC                | REST Gateway      | Performance  |
| **Real-time System** | gRPC + Streaming    | WebSocket         | Latency      |
| **Web Dashboard**    | GraphQL/REST        | WebSocket         | UX           |
| **IoT/Sensors**      | gRPC                | Message Queue     | Scale        |

---

## THAM KHẢO & TÀI LIỆU

### Official Documentation

- REST: [REST API Best Practices](https://restfulapi.net/)
- gRPC: [gRPC Documentation](https://grpc.io/)
- GraphQL: [GraphQL Documentation](https://graphql.org/)

### Case Studies

- Netflix: gRPC for microservices
- GitHub: REST to GraphQL migration
- Uber: gRPC architecture
- Airbnb: GraphQL at scale

### Benchmarks

```
Payload Size (1000 users):
- REST (JSON): ~50KB
- gRPC (Protobuf): ~5KB (90% reduction)
- GraphQL (minimal query): ~5KB

Latency (p99):
- REST: 50-100ms
- gRPC: 5-10ms
- GraphQL: 30-80ms (query-dependent)
```

---

**Tài liệu hoàn thành: 02/02/2026**  
**Tác giả: Đặng Công Huyền - MSV: 22654611**
