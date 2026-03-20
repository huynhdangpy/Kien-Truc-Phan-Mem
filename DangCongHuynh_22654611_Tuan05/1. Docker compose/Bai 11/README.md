# Bài 11: Chạy dịch vụ Postgres với Adminer

## Yêu cầu

- Chạy PostgreSQL và Adminer (công cụ quản lý database) bằng Docker Compose
- PostgreSQL phải có database tên mydb, user là user, password là password
- Adminer chạy trên cổng 8083

## docker-compose.yml Giải thích

- **postgres:15-alpine**: Image PostgreSQL phiên bản 15 (alpine nhẹ)
- **POSTGRES_DB**: Tên database được tạo tự động
- **POSTGRES_USER** và **POSTGRES_PASSWORD**: Thông tin đăng nhập
- **adminer**: Giao diện web quản lý database tương tự như PHPMyAdmin

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập Adminer

Mở trình duyệt: `http://localhost:8083`

Đăng nhập với:

- **Server**: postgres
- **Username**: user
- **Password**: password
- **Database**: mydb

## Kết nối trực tiếp PostgreSQL

```bash
docker-compose exec postgres psql -U user -d mydb
```

Các lệnh PostgreSQL cơ bản:

```
\dt              # Liệt kê các bảng
CREATE TABLE users (id SERIAL, name VARCHAR(100));
INSERT INTO users (name) VALUES ('John');
SELECT * FROM users;
```

## Kiểm tra container

```bash
docker-compose ps
```

## Xem logs

```bash
docker-compose logs -f
```

## Dừng

```bash
docker-compose down
```

## Lưu ý

- PostgreSQL mất thời gian để khởi động
- Hãy đợi 10-15 giây sau khi chạy docker-compose up
