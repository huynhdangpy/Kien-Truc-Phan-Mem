# Bài 8: Kết nối nhiều dịch vụ với Docker Compose

## Yêu cầu

- Chạy Node.js kết nối với MySQL

## Cấu trúc

- Node.js container kết nối đến MySQL container
- Các container trong cùng một mạng (mynetwork)

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập ứng dụng

- Trang chủ: `http://localhost:3000`
- Kiểm tra kết nối: `http://localhost:3000/api/status`

## Xem logs

```bash
docker-compose logs -f nodejs
```

## Kết nối trực tiếp MySQL

```bash
docker-compose exec mysql mysql -u user -p
# Password: userpass
```

## Dừng

```bash
docker-compose down
```

## Giải thích

- **DB_HOST**: Tên DNS của container MySQL
- **depends_on**: Đảm bảo MySQL khởi động trước Node.js
- **networks**: Cả hai container trong cùng mạng để giao tiếp
