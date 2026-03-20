# Bài 13: Chạy ứng dụng React với Nginx

## Yêu cầu

- Chạy một ứng dụng React và serve nó bằng Nginx

## Cấu trúc

- **Node container**: Chạy React dev server cho phát triển
- **Nginx container**: Serve ứng dụng React được build (sản xuất)

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập ứng dụng

- Node dev server: `http://localhost:3000`
- Nginx (production): `http://localhost` (port 80)

## Build ứng dụng React

```bash
docker-compose exec node npm run build
```

## Xem logs

```bash
docker-compose logs -f
```

## Dừng

```bash
docker-compose down
```

## Giải thích

- **Node container**: Dùng cho phát triển, support hot reload
- **Nginx container**: Dùng cho sản xuất, serve static files từ thư mục build
- **nginx.conf**: Cấu hình Nginx để hỗ trợ React Router (SPA)

## Lưu ý

- Ban đầu thư mục build có thể chưa tồn tại, hãy chạy npm run build
- Các file React (App.js, index.js, etc.) phải tương ứng với project của bạn
