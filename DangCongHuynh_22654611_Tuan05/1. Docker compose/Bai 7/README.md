# Bài 7: Chạy MongoDB với Docker Compose

## Yêu cầu

- Chạy MongoDB và Mongo Express để quản lý

## docker-compose.yml Giải thích

- **mongodb**: Container MongoDB với user admin
- **mongo-express**: Giao diện web quản lý MongoDB
- **ME_CONFIG_MONGODB_URL**: Chuỗi kết nối MongoDB

## Cách chạy

```bash
docker-compose up -d
```

## Truy cập Mongo Express

Mở trình duyệt: `http://localhost:8081`

## Kết nối với MongoDB

```bash
docker-compose exec mongodb mongosh -u admin -p adminpass
```

Các lệnh MongoDB cơ bản:

```
show dbs
use mydb
db.collection.insert({name: "John", age: 30})
db.collection.find()
```

## Kiểm tra container

```bash
docker-compose ps
```

## Dừng

```bash
docker-compose down
```

## Lưu ý

- MongoDB mất thời gian để khởi động
- Hãy đợi khoảng 10-15 giây sau khi chạy docker-compose up
