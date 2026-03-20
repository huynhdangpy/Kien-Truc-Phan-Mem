# Bài 9: Chạy ứng dụng Python Flask với Docker Compose

## Yêu cầu

- Chạy ứng dụng Flask đơn giản với Docker Compose

## Cấu trúc file

- **docker-compose.yml**: Cấu hình Docker Compose
- **Dockerfile**: Xây dựng image Python
- **app.py**: Ứng dụng Flask
- **requirements.txt**: Dependencies

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập ứng dụng

- Trang chủ: `http://localhost:5000`
- API: `http://localhost:5000/api`
- Users: `http://localhost:5000/api/users`

## Xem logs

```bash
docker-compose logs -f
```

## Dừng

```bash
docker-compose down
```

## Giải thích

- **FLASK_ENV: development**: Chạy trong chế độ phát triển
- **volumes**: Mount thư mục hiện tại để phát triển nóng
- **python:3.11-slim**: Image Python nhẹ
