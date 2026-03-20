# Bài 14: Cấu hình mạng riêng giữa các container

## Yêu cầu

- Chạy 2 container có thể giao tiếp với nhau trong một mạng riêng

## docker-compose.yml Giải thích

- **networks**: Định nghĩa mạng riêng có tên `private-network`
- Cả hai container được kết nối vào mạng này
- Container có thể giao tiếp với nhau bằng hostname (tên container)

## Cách chạy

```bash
docker-compose up -d
```

## Kiểm tra container

```bash
docker-compose ps
```

## Kết nối giữa các container

Từ container1, kiểm tra kết nối đến container2:

```bash
docker-compose exec container1 ping container2
```

Đầu ra phải là:

```
PING container2 (172.x.x.x)
64 bytes from container2: seq=0 ttl=64 time=0.xxx ms
```

## Liệt kê mạng

```bash
docker network ls
```

Xem chi tiết mạng:

```bash
docker network inspect <network_name>
```

## Kiểm tra DNS

```bash
docker-compose exec container1 nslookup container2
```

## Dừng

```bash
docker-compose down
```

## Lưu ý

- Mạng bridge là loại mạng mặc định cho Docker Compose
- Container được tự động cấp địa chỉ IP trong mạng
- Tên container được tự động đăng ký trong DNS của mạng đó
