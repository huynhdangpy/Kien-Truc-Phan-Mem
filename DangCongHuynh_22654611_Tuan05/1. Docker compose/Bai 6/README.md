# Bài 6: Chạy WordPress với MySQL

## Yêu cầu

- Chạy WordPress với MySQL bằng Docker Compose

## docker-compose.yml Giải thích

- **WORDPRESS_DB_HOST**: Tên DNS của MySQL container
- **WORDPRESS_DB_NAME**, **WORDPRESS_DB_USER**, **WORDPRESS_DB_PASSWORD**: Thông tin database
- **volumes**: Lưu trữ file WordPress và dữ liệu MySQL

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập WordPress

Mở trình duyệt: `http://localhost:8080`

Làm theo hướng dẫn cài đặt WordPress

## Kiểm tra container

```bash
docker-compose ps
```

## Xem logs

```bash
docker-compose logs -f wordpress
```

## Dừng

```bash
docker-compose down
```

## Lưu ý

- MySQL mất thời gian để khởi động, nên WordPress có thể gặp lỗi lần đầu
- Hãy đợi một chút rồi refresh trình duyệt
