# So Sánh Code: REST vs gRPC vs GraphQL

## 1. Tạo User

### REST API

```javascript
// POST /api/users
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const newUser = { id: getNextId(users), name, email };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// Client call
fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
})
  .then((r) => r.json())
  .then((data) => console.log(data));
```

### gRPC API

```protobuf
message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message CreateUserResponse {
  User user = 1;
}

service UserService {
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
}
```

```javascript
// Server
createUser: (call, callback) => {
  const { name, email } = call.request;
  const newUser = { id: getNextId(users), name, email };
  users.push(newUser);
  callback(null, { user: newUser });
};

// Client call
client.createUser(
  { name: "Alice", email: "alice@example.com" },
  (err, response) => console.log(response.user),
);
```

### GraphQL API

```graphql
type Mutation {
  createUser(name: String!, email: String!): User!
}

type User {
  id: Int!
  name: String!
  email: String!
}
```

```javascript
// Server resolver
Mutation: {
  createUser: (_, { name, email }) => {
    const newUser = { id: getNextId(users), name, email };
    users.push(newUser);
    return newUser;
  }
};

// Client query
mutation {
  createUser(name: "Alice", email: "alice@example.com") {
    id
    name
    email
  }
}
```

---

## 2. Lấy User + Posts

### REST API

```javascript
// Needs 2 requests
GET / api / users / 1; // Get user
GET / api / users / 1 / posts; // Get posts

// Over-fetching problem:
// GET /users returns: { id, name, email, created_at, updated_at, ... }
// But client only needs: { id, name }
```

### gRPC API

```javascript
// Single RPC call, then manually fetch posts
client.getUser({ id: 1 }, (err, userResponse) => {
  // Still need separate call for posts
  client.streamUserPosts({ userId: 1 }, (postsResponse) => {
    // Combine data
  });
});
```

### GraphQL API

```graphql
# Single query gets everything needed
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

# Response has only requested fields (no over-fetching)
```

---

## 3. Validation

### REST API

```javascript
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  // Manual validation
  if (!name || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // ... create user
});
```

### gRPC API

```protobuf
// Type-safe: protobuf enforces types
message CreateUserRequest {
  string name = 1;        // Must be string
  string email = 2;       // Must be string
}

// Validation still manual in resolver
```

### GraphQL API

```graphql
type Mutation {
  createUser(name: String!, email: String!): User!
  # ! means required/non-null
  # GraphQL validates types automatically
}
```

---

## 4. Performance Comparison

### Request Size

#### REST (JSON)

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-02T00:00:00Z"
}
```

**Size: ~150 bytes**

#### gRPC (Protobuf binary)

```
Binary encoded (fields only sent if changed)
```

**Size: ~30 bytes (80% smaller!)**

#### GraphQL (JSON)

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Alice"
    }
  }
}
```

**Size: ~50 bytes (only requested fields)**

---

## 5. Streaming

### REST API

```javascript
// Not native - need WebSocket
app.ws("/api/posts-stream", (ws, req) => {
  posts.forEach((post) => {
    ws.send(JSON.stringify(post));
  });
});
```

### gRPC API

```protobuf
// Native bidirectional streaming
service UserService {
  rpc StreamUserPosts(GetUserPostsRequest) returns (stream Post);
}
```

```javascript
// Server sends multiple responses
streamUserPosts: (call) => {
  posts.forEach((post) => {
    call.write(post); // Stream each post
  });
  call.end();
};

// Client receives stream
const call = client.streamUserPosts({ userId: 1 });
call.on("data", (post) => console.log(post));
```

### GraphQL API

```graphql
# Subscriptions (WebSocket-based)
type Subscription {
  postCreated: Post!
}

subscription {
  postCreated {
    id
    title
  }
}
```

---

## 6. Error Handling

### REST API

```javascript
// HTTP status codes
res.status(404).json({ error: "User not found" });
res.status(400).json({ error: "Invalid input" });
res.status(500).json({ error: "Server error" });
```

### gRPC API

```javascript
// gRPC status codes
callback({
  code: grpc.status.NOT_FOUND,
  details: "User not found",
});

callback({
  code: grpc.status.INVALID_ARGUMENT,
  details: "Invalid input",
});
```

### GraphQL API

```graphql
# Errors in response
{
  "data": null,
  "errors": [
    {
      "message": "User not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

---

## 7. Client Implementation

### REST Client

```javascript
// Fetch API
const response = await fetch("/api/users/1");
const user = await response.json();

// Or axios
const { data } = await axios.get("/api/users/1");
```

### gRPC Client

```javascript
// Must load proto file
const client = new api.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure(),
);

// Callback-based
client.getUser({ id: 1 }, (err, response) => {
  if (err) console.error(err);
  else console.log(response.user);
});
```

### GraphQL Client

```javascript
// Apollo Client (most common)
const query = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      name
    }
  }
`;

const { data } = await client.query({
  query,
  variables: { id: 1 },
});

// Or simple HTTP
fetch("/graphql", {
  method: "POST",
  body: JSON.stringify({ query }),
});
```

---

## 8. Caching

### REST API

```javascript
// HTTP caching (automatic)
// GET request can be cached by browser/CDN
// Headers: Cache-Control, ETag, Last-Modified
```

```http
GET /api/users/1 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: max-age=3600
ETag: "abc123"
```

### gRPC API

```javascript
// No built-in HTTP caching
// Must implement application-level caching
// HTTP/2 doesn't have standard cache semantics like HTTP/1.1
```

### GraphQL API

```javascript
// POST-based, harder to cache
// Apollo Client handles client-side caching
// Server-side caching needs implementation
```

---

## 9. Cấu Trúc Thư Mục

### REST Project

```
REST-API/
├── server.js           (simple, linear)
├── routes/
│   ├── users.js
│   └── posts.js
├── middleware/
│   └── auth.js
└── package.json
```

### gRPC Project

```
gRPC-API/
├── server.js
├── client.js
├── proto/
│   └── api.proto       (schema required)
└── package.json
```

### GraphQL Project

```
GraphQL-API/
├── server.js
├── client.js           (optional for testing)
├── schema.js           (or inline in server.js)
├── resolvers.js        (logic)
└── package.json
```

---

## Tóm Tắt

| Khía Cạnh                   | REST         | gRPC   | GraphQL   |
| --------------------------- | ------------ | ------ | --------- |
| **Lines of Code**           | 100+         | 50     | 80        |
| **Payload Size**            | 150B         | 30B    | 50B       |
| **Requests for User+Posts** | 2            | 2\*    | 1         |
| **Type Safety**             | ❌           | ✅     | ✅        |
| **Browser Support**         | ✅           | ❌     | ✅        |
| **Streaming**               | WebSocket    | Native | WebSocket |
| **Learning Curve**          | Easy         | Hard   | Medium    |
| **Caching**                 | ✅ Excellent | ❌     | ❌        |
| **Performance**             | Medium       | High   | Medium    |

\*\*\* gRPC: chủ yếu vẫn cần 2 calls trừ khi design đặc biệt
