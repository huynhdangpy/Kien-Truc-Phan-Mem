# Bài 5: Chạy Redis với Docker Compose

## Yêu cầu

- Chạy một container Redis trên cổng 6379

## docker-compose.yml Giải thích

- **redis:7-alpine**: Image Redis phiên bản 7 (alpine version nhẹ)
- **appendonly yes**: Bật AOF persistence để dữ liệu không bị mất
- **healthcheck**: Kiểm tra sức khỏe container
- **volumes**: Lưu trữ dữ liệu Redis

## Cách chạy

```bash
docker-compose up -d
```

## Kiểm tra container

```bash
docker-compose ps
```

## Kết nối với Redis

```bash
docker-compose exec redis redis-cli
```

Các lệnh Redis cơ bản:

```
SET key value
GET key
INCR counter
LPUSH list item
RPUSH list item
LPOP list
```

## Xem logs

```bash
docker-compose logs -f
```

## Dừng

```bash
docker-compose down
```
