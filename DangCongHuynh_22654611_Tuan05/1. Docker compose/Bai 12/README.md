# Bài 12: Giám sát container với Prometheus và Grafana

## Yêu cầu

- Chạy Prometheus, Grafana và Node Exporter bằng Docker Compose để giám sát hệ thống

## Các thành phần

- **Node Exporter**: Thu thập metrics từ hệ thống
- **Prometheus**: Lưu trữ và xử lý metrics
- **Grafana**: Hiển thị metrics dưới dạng dashboard

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập dịch vụ

- **Node Exporter**: `http://localhost:9100`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000`

## Đăng nhập Grafana

- **Username**: admin
- **Password**: admin

## Cấu hình Grafana

1. Vào `http://localhost:3000`
2. Đăng nhập với admin/admin
3. Vào **Configuration** > **Data Sources**
4. Thêm data source mới:
   - **Type**: Prometheus
   - **URL**: http://prometheus:9090
5. Tạo dashboard
   - Import dashboard từ https://grafana.com/grafana/dashboards
   - Dashboard ID: 1860 (Node Exporter)

## Kiểm tra Prometheus

Vào `http://localhost:9090/targets` để xem các target được giám sát

## Dừng

```bash
docker-compose down
```

## Lưu ý

- Prometheus config file phải trong cùng thư mục
- Grafana cần vài giây để khởi động
