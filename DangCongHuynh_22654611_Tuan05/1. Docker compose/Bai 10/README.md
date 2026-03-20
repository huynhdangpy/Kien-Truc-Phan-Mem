# Bài 10: Lưu trữ dữ liệu với Docker Volumes

## Yêu cầu

- Chạy MySQL và gắn volume để dữ liệu không bị mất

## docker-compose.yml Giải thích

- **volumes**: Định nghĩa volume có tên `mysql_volume`
- Dữ liệu MySQL lưu trong `/var/lib/mysql` của container được map đến volume
- Khi container dừng, dữ liệu vẫn còn trong volume

## Volume Management

Xem tất cả volume:

```bash
docker volume ls
```

Xem chi tiết volume:

```bash
docker volume inspect mysql_volume
```

## Cách chạy

```bash
docker-compose up -d
```

## Tạo dữ liệu test

```bash
docker-compose exec mysql mysql -u user -p
# Password: userpass
CREATE TABLE users (id INT, name VARCHAR(100));
INSERT INTO users VALUES (1, 'John');
SELECT * FROM users;
```

## Dừng và xóa container

```bash
docker-compose down
```

## Khôi phục dữ liệu

```bash
docker-compose up -d
docker-compose exec mysql mysql -u user -p
SELECT * FROM users;  # Dữ liệu vẫn còn!
```

## Xóa volume (CẨN THẬN - mất dữ liệu!)

```bash
docker volume rm mysql_volume
```

## Giải thích

- **local driver**: Lưu trữ trên máy host
- Dữ liệu không bị mất khi container dừng
- Volume có thể được sử dụng lại khi container khởi động lại
