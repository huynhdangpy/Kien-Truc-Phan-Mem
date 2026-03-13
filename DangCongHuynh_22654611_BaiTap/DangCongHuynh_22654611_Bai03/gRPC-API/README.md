# gRPC API - Users & Posts Management

**Công nghệ:** Node.js + gRPC + Protocol Buffers

## Cấu Trúc

```
gRPC-API/
├── server.js          # gRPC server
├── client.js          # Test client
├── api.proto          # Protocol Buffer definitions
├── package.json       # Dependencies
└── README.md
```

## Cài Đặt & Chạy

### 1. Cài đặt dependencies

```bash
cd gRPC-API
npm install
```

### 2. Chạy server

```bash
npm start
```

Server sẽ chạy tại: `localhost:50051`

### 3. Test gRPC (trong terminal khác)

```bash
npm run client
```

## Services & RPCs

### UserService

| RPC Type      | Method          | Request             | Response           |
| ------------- | --------------- | ------------------- | ------------------ |
| Unary         | GetUser         | GetUserRequest      | GetUserResponse    |
| Unary         | CreateUser      | CreateUserRequest   | CreateUserResponse |
| Unary         | ListUsers       | ListUsersRequest    | ListUsersResponse  |
| Unary         | CreatePost      | CreatePostRequest   | CreatePostResponse |
| Server Stream | StreamUserPosts | GetUserPostsRequest | stream Post        |

## Protocol Buffer Definition

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc CreatePost(CreatePostRequest) returns (CreatePostResponse);
  rpc StreamUserPosts(GetUserPostsRequest) returns (stream Post);
}
```

## Ví Dụ Code Client

### Unary RPC

```javascript
client.getUser({ id: 1 }, (err, response) => {
  console.log(response.user);
});
```

### Server Streaming RPC

```javascript
const call = client.streamUserPosts({ userId: 1 });

call.on("data", (post) => {
  console.log("Received:", post);
});

call.on("end", () => {
  console.log("Stream ended");
});
```

## Đặc Điểm gRPC

✅ **Ưu điểm:**

- Hiệu năng rất cao (HTTP/2)
- Binary format (Protobuf) nhỏ gọn
- Bidirectional streaming
- Type-safe (schema-driven)
- Tuyệt vời cho microservices
- Latency thấp (<10ms)

❌ **Nhược điểm:**

- Không hỗ trợ browser trực tiếp
- Khó debug (binary format)
- Learning curve cao
- Cần gRPC-web wrapper cho browser
- Ecosystem nhỏ hơn REST

## So Sánh Hiệu Năng vs REST

```
Payload size: gRPC 10x nhỏ hơn REST JSON
Latency: gRPC ~5-10ms, REST ~50-100ms
Throughput: gRPC cao hơn nhờ multiplexing
```

## Khi Nào Dùng gRPC

✓ Microservices communication
✓ Real-time streaming data
✓ High-performance systems
✓ Internal company infrastructure
✓ IoT & sensors
✓ Bandwidth-critical applications

❌ Không phù hợp:

- Public APIs (cần browser support)
- Simple CRUD operations
- Khi performance không quan trọng
