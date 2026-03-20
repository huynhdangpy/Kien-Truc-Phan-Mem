# Bài 3: Kết nối MySQL với PHPMyAdmin

## Yêu cầu

- Chạy MySQL và PHPMyAdmin với Docker Compose
- PHPMyAdmin chạy trên cổng 8081

## docker-compose.yml Giải thích

- **depends_on**: Đảm bảo MySQL khởi động trước PHPMyAdmin
- **networks**: Cả MySQL và PHPMyAdmin trong cùng mạng để giao tiếp
- **PMA_HOST**: DNS name của MySQL container
- **PMA_USER** và **PMA_PASSWORD**: Thông tin đăng nhập

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập PHPMyAdmin

Mở trình duyệt: `http://localhost:8081`

Đăng nhập với:

- **Username**: user
- **Password**: password

## Kiểm tra

```bash
docker-compose ps
```

## Dừng

```bash
docker-compose down
```
