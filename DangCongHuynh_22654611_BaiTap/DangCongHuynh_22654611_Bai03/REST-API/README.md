# REST API - Users & Posts Management

**Công nghệ:** Node.js + Express.js

## Cấu Trúc

```
REST-API/
├── server.js          # Express server
├── client.js          # Test client
├── package.json       # Dependencies
└── README.md
```

## Cài Đặt & Chạy

### 1. Cài đặt dependencies

```bash
cd REST-API
npm install
```

### 2. Chạy server

```bash
npm start
# hoặc: npm run dev (với hot reload)
```

Server sẽ chạy tại: `http://localhost:3000`

### 3. Test API (trong terminal khác)

```bash
node client.js
```

## Các Endpoints

### Users

| Method | Endpoint         | Mô Tả            |
| ------ | ---------------- | ---------------- |
| GET    | `/api/users`     | Lấy tất cả users |
| GET    | `/api/users/:id` | Lấy user theo ID |
| POST   | `/api/users`     | Tạo user mới     |
| PUT    | `/api/users/:id` | Cập nhật user    |
| DELETE | `/api/users/:id` | Xóa user         |

### Posts

| Method | Endpoint                   | Mô Tả              |
| ------ | -------------------------- | ------------------ |
| GET    | `/api/posts`               | Lấy tất cả posts   |
| GET    | `/api/posts/:id`           | Lấy post theo ID   |
| GET    | `/api/users/:userId/posts` | Lấy posts của user |
| POST   | `/api/posts`               | Tạo post mới       |
| PUT    | `/api/posts/:id`           | Cập nhật post      |
| DELETE | `/api/posts/:id`           | Xóa post           |

## Ví Dụ Requests (cURL)

### Get all users

```bash
curl http://localhost:3000/api/users
```

### Create user

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com"}'
```

### Get user's posts

```bash
curl http://localhost:3000/api/users/1/posts
```

### Delete post

```bash
curl -X DELETE http://localhost:3000/api/posts/1
```

## Vấn Đề REST API Minh Họa

### Over-fetching

```
GET /api/users/1
Response: {
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"  // Chỉ cần name nhưng lấy cả object
}
```

### Under-fetching

```
Cần 2 requests để lấy user + posts:
GET /api/users/1
GET /api/users/1/posts

Không thể lấy đủ data trong 1 request
```

## Đặc Điểm REST

✅ **Ưu điểm:**

- Dễ hiểu, dễ sử dụng
- HTTP caching tốt
- Hỗ trợ browser tốt
- Phù hợp public APIs

❌ **Nhược điểm:**

- Over-fetching: lấy dữ liệu không cần
- Under-fetching: cần nhiều requests
- Versioning khó quản lý

## Khi Nào Dùng REST

✓ Public APIs
✓ Simple CRUD operations
✓ HTTP caching quan trọng
✓ Stateless services
