# Bài 4: Chạy ứng dụng Node.js với Docker Compose

## Yêu cầu

- Chạy một ứng dụng Node.js đơn giản với Express

## Cấu trúc file

- **docker-compose.yml**: Cấu hình Docker Compose
- **Dockerfile**: Xây dựng image Node.js
- **app.js**: Ứng dụng Express đơn giản
- **package.json**: Dependencies

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập ứng dụng

- Trang chủ: `http://localhost:3000`
- API: `http://localhost:3000/api`

## Xem logs

```bash
docker-compose logs -f
```

## Dừng

```bash
docker-compose down
```

## Giải thích

- **build**: Xây dựng image từ Dockerfile trong thư mục hiện tại
- **volumes**: Mount thư mục hiện tại vào container để phát triển nóng
- **working_dir**: Đặt thư mục làm việc trong container
- **command**: Lệnh khởi động ứng dụng
