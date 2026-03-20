# Bài 2: Chạy MySQL với Docker Compose

## Yêu cầu

- Tạo một container chạy MySQL phiên bản 8.0
- Đặt username là user, password là password và database là mydb

## docker-compose.yml Giải thích

- **MYSQL_ROOT_PASSWORD**: Mật khẩu cho root user
- **MYSQL_USER**: Tên user để truy cập MySQL
- **MYSQL_PASSWORD**: Mật khẩu của user
- **MYSQL_DATABASE**: Database được tạo tự động khi container khởi động
- **volumes**: Lưu trữ dữ liệu MySQL để không bị mất khi container dừng

## Cách chạy

```bash
docker-compose up -d
```

## Kiểm tra container

```bash
docker-compose ps
```

## Kết nối với MySQL

```bash
docker-compose exec mysql mysql -u user -p
# Nhập password: password
```

## Xem logs

```bash
docker-compose logs -f
```

## Dừng container

```bash
docker-compose down
```
