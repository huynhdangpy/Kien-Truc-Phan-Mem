# Bài 1: Chạy một container đơn giản với Docker Compose

## Yêu cầu

- Tạo một container chạy Nginx bằng Docker Compose
- Map cổng 8080 của máy host với cổng 80 của container

## Cách chạy

### 1. Kiểm tra Docker và Docker Compose đã cài đặt

```bash
docker --version
docker-compose --version
```

### 2. Chạy container

Trong thư mục chứa file `docker-compose.yml`, chạy lệnh:

```bash
docker-compose up -d
```

### 3. Kiểm tra container đang chạy

```bash
docker-compose ps
```

### 4. Truy cập Nginx

Mở trình duyệt web và truy cập:

```
http://localhost:8080
```

Bạn sẽ thấy trang chủ mặc định của Nginx.

### 5. Xem logs

```bash
docker-compose logs -f
```

### 6. Dừng container

```bash
docker-compose down
```

## Giải thích docker-compose.yml

- **version**: Phiên bản của Docker Compose
- **services**: Định nghĩa các dịch vụ (trong trường hợp này là `nginx`)
- **image**: Sử dụng image `nginx:latest` từ Docker Hub
- **ports**: Map cổng 8080 của host đến cổng 80 của container
- **container_name**: Tên của container
