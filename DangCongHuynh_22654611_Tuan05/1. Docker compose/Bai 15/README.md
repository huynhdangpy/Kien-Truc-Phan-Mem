# Bài 15: Giới hạn tài nguyên cho container

## Yêu cầu

- Giới hạn CPU và RAM cho một container Redis

## docker-compose.yml Giải thích

- **deploy.resources.limits**: Giới hạn tối đa mà container có thể sử dụng
  - **cpus**: Giới hạn CPU (0.5 = 50% của 1 CPU core)
  - **memory**: Giới hạn bộ nhớ (256M = 256 MB)
- **deploy.resources.reservations**: Yêu cầu tối thiểu được cấp phát
  - **cpus**: 25% của 1 CPU core
  - **memory**: 128 MB

## Cách chạy

```bash
docker-compose up -d
```

## Kiểm tra giới hạn

Xem chi tiết container:

```bash
docker inspect redis-limited
```

Tìm phần `HostConfig` để thấy các giới hạn được thiết lập.

## Giám sát sử dụng tài nguyên

```bash
docker stats redis-limited
```

Đầu ra sẽ hiển thị:

- **CONTAINER**: Tên container
- **CPU %**: Mức sử dụng CPU hiện tại
- **MEM USAGE / LIMIT**: Bộ nhớ đang sử dụng / Giới hạn
- **MEM %**: Phần trăm bộ nhớ được sử dụng
- **NET I/O**: Lưu lượng mạng nhập/xuất

## Test stress

Tạo dữ liệu lớn trong Redis:

```bash
docker-compose exec redis redis-cli
```

Thực hiện các lệnh:

```
SET bigkey "$(head -c 100000 /dev/urandom | base64)"
MEMORYUSAGE bigkey
```

## Dừng giám sát

```bash
CTRL+C
```

## Dừng container

```bash
docker-compose down
```

## Lưu ý

- Giới hạn CPU không được hỗ trợ trên Docker Desktop dành cho Windows
- Trên Linux native Docker, CPU limits hoạt động bình thường
- Giới hạn memory được hỗ trợ trên cả Windows và Linux
- Nếu container vượt quá định ngạch memory, nó sẽ bị OOMKilled (Out of Memory)
