# GraphQL API - Users & Posts Management

**Công nghệ:** Node.js + Apollo Server + GraphQL

## Cấu Trúc

```
GraphQL-API/
├── server.js          # Apollo Server
├── client.js          # Test client
├── package.json       # Dependencies
└── README.md
```

## Cài Đặt & Chạy

### 1. Cài đặt dependencies

```bash
cd GraphQL-API
npm install
```

### 2. Chạy server

```bash
npm start
# hoặc: npm run dev (với hot reload)
```

Server sẽ chạy tại: `http://localhost:4000`  
**Apollo Studio:** http://localhost:4000 (interactive GraphQL explorer)

### 3. Test GraphQL (trong terminal khác)

```bash
node client.js
```

## GraphQL Schema

### Types

```graphql
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
```

### Query (Read)

```graphql
type Query {
  user(id: Int!): User
  users: [User!]!
  post(id: Int!): Post
  posts: [Post!]!
}
```

### Mutation (Write)

```graphql
type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(userId: Int!, title: String!, content: String!): Post!
  updateUser(id: Int!, name: String, email: String): User
  deleteUser(id: Int!): Boolean!
  deletePost(id: Int!): Boolean!
}
```

## Ví Dụ Queries

### Query 1: Get user (no over-fetching)

```graphql
query {
  user(id: 1) {
    name
    email
  }
}
```

### Query 2: Get user with posts (no under-fetching)

```graphql
query {
  user(id: 1) {
    id
    name
    posts {
      title
      content
    }
  }
}
```

### Query 3: Get all posts with author

```graphql
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
```

### Mutation 1: Create user

```graphql
mutation {
  createUser(name: "Charlie", email: "charlie@example.com") {
    id
    name
    email
  }
}
```

### Mutation 2: Create post

```graphql
mutation {
  createPost(userId: 1, title: "GraphQL Post", content: "Testing") {
    id
    title
    author {
      name
    }
  }
}
```

### Mutation 3: Update user

```graphql
mutation {
  updateUser(id: 1, name: "Alice Updated") {
    id
    name
    email
  }
}
```

## Đặc Điểm GraphQL

✅ **Ưu điểm:**

- Lấy chính xác dữ liệu cần thiết
- Không over-fetching/under-fetching
- Single endpoint: dễ quản lý
- Type system mạnh mẽ
- Introspection: auto-generate docs
- Không cần versioning
- Tuyệt vời cho mobile apps
- Bandwidth optimization

❌ **Nhược điểm:**

- Phức tạp hơn để học
- Performance: complex queries có thể chậm
- Caching khó hơn (POST-based)
- N+1 query problem
- Memory consumption cao

## So Sánh Bandwidth: GraphQL vs REST

```
REST Example:
GET /api/users/1        → 1KB
GET /api/users/1/posts  → 2KB
Total: 3 requests, 3KB

GraphQL Example:
POST /graphql
{
  user(id: 1) {
    name
    posts { title }
  }
}
→ 1 request, 0.5KB
→ 85% tiết kiệm bandwidth
```

## Khi Nào Dùng GraphQL

✓ Mobile Apps (bandwidth optimization)
✓ Complex nested data queries
✓ Rapid frontend development
✓ Multiple data sources
✓ Real-time subscriptions cần
✓ Web dashboards with multiple widgets
✓ Khi over/under-fetching là vấn đề

❌ Không phù hợp:

- Simple CRUD APIs
- Static content
- Khi caching HTTP quan trọng
- Khi team không biết GraphQL

## Apollo Studio

Sau khi chạy server, mở http://localhost:4000 để:

- Viết queries interactively
- Xem schema documentation
- Xem query suggestions
- Debug queries
