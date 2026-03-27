# 📊 So Sánh 2 Trường Hợp: Data Persistence trong Docker

## ❓ Câu Hỏi: Data Còn Không?

---

## 🔴 TRƯỜNG HỢP 1: CÓ COMMIT

### Flow

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Lấy Image từ Docker Hub                        │
│         postgres:15 (150MB)                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Run Container 1                                │
│         docker run --name pg1 postgres:15              │
│         Container ID: abc123...                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Insert Data vào Database                       │
│         CREATE DATABASE testdb;                        │
│         CREATE TABLE users (id, name, email);          │
│         INSERT INTO users VALUES (1, 'Alice', ...);    │
│         Data lưu ở: /var/lib/postgresql/data/         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: COMMIT - Tạo Image Mới từ Container            │
│         docker commit pg1 postgres-with-data:v1        │
│         Image size: 390MB (150MB + 240MB data)         │
│         ⚠️  Image này chứa CẢ DATABASE FILES           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: Stop & Remove Container 1                      │
│         docker stop pg1                                │
│         docker rm pg1                                  │
│         ❌ Container mất, nhưng IMAGE vẫn có data      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 6: Run Container 2 từ Image MỚI                   │
│         docker run --name pg2 postgres-with-data:v1    │
│         Container ID: def456...                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 7: CHECK DATA                                      │
│         docker exec pg2 psql -c "SELECT * FROM users;" │
│         ✅ Result: (1, 'Alice', ...)                   │
│         ✅ DATA VẪN CÒN!                               │
└─────────────────────────────────────────────────────────┘
```

### ✅ Kết Quả

```
✅ Data còn lại
✅ Có thể chạy container mới bất kỳ lúc nào
✅ Share image này với team khác
```

### ❌ Vấn Đề

```
❌ Image size LỚN: 390MB (vs 150MB bình thường)
❌ Khó update/modify data
❌ Anti-pattern - không phải cách production dùng
❌ Database files lưu trong image (hard to manage)
❌ Layer sharing không hoạt động tốt với volumes
```

---

## 🟢 TRƯỜNG HỢP 2: KHÔNG COMMIT (Chỉ Container)

### Flow

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Lấy Image từ Docker Hub                        │
│         postgres:15 (150MB)                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Run Container 1                                │
│         docker run --name pg1 postgres:15              │
│         Container ID: abc123...                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Insert Data vào Database                       │
│         CREATE DATABASE testdb;                        │
│         CREATE TABLE users (id, name, email);          │
│         INSERT INTO users VALUES (1, 'Alice', ...);    │
│         Data lưu ở: /var/lib/postgresql/data/         │
│         (CHỈ trong Container Layer - ngắn hạn)        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: KHÔNG COMMIT - Chỉ REMOVE Container            │
│         docker rm pg1                                  │
│         ❌ Container mất                               │
│         ❌ Container Layer xóa                         │
│         ❌ DATA MẤT!                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: Run Container 2 từ Image GỐCC (postgres:15)   │
│         docker run --name pg2 postgres:15              │
│         Container ID: def456...                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 6: CHECK DATA                                      │
│         docker exec pg2 psql -c "SELECT * FROM users;" │
│         ❌ ERROR: database "testdb" does not exist     │
│         ❌ DATA MẤT!                                   │
└─────────────────────────────────────────────────────────┘
```

### ❌ Kết Quả

```
❌ Data MẤT
❌ Container mới là "fresh" - không có dữ liệu
❌ Phải insert lại từ đầu
```

### ⚠️ Lý Do

```
- Container layer là tạm thời (ephemeral)
- Khi remove container → container layer xóa
- Data không được persist (lưu) ở volume hoặc image
- Điều này là DESIGN của Docker (containers nên stateless)
```

---

## 📋 BẢNG SO SÁNH CHI TIẾT

| Yếu Tố                 | Có Commit                     | Không Commit        |
| ---------------------- | ----------------------------- | ------------------- |
| **Data Flow**          | Image ← Container → ngược lại | Container → xóa     |
| **Data Persist?**      | ✅ CÓ (trong image)           | ❌ KHÔNG            |
| **Container 2**        | Có data                       | Không data          |
| **Image Size**         | 📦 LỚN (390MB)                | 📦 NHỎ (150MB)      |
| **Portability**        | ✅ Dễ share image             | ❌ Chỉ có image gốc |
| **Use Case**           | Demo, Testing                 | Development         |
| **Recommendation**     | ⚠️ Không nên                  | ❌ Mất data         |
| **Better Alternative** | ❓ Xem dưới                   | ✅ Volumes          |

---

## ✅ CÁCH ĐÚNG (Best Practice): DÙng VOLUMES

### Flow

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Tạo Named Volume (nơi lưu data)               │
│         docker volume create pg_data                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Run Container 1 với Volume                     │
│         docker run --name pg1                          │
│           -v pg_data:/var/lib/postgresql/data \        │
│           postgres:15                                  │
│         Volume pg_data ← → Container /var/lib/postgres │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Insert Data                                    │
│         CREATE DATABASE testdb;                        │
│         INSERT INTO users VALUES (1, 'Alice', ...);    │
│         Data lưu ở VOLUME (không phải container!)     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: REMOVE Container 1                             │
│         docker rm pg1                                  │
│         ✅ Volume VẪN CÒN (data persist!)             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: Run Container 2 với SAME Volume                │
│         docker run --name pg2                          │
│           -v pg_data:/var/lib/postgresql/data \        │
│           postgres:15                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 6: CHECK DATA                                      │
│         docker exec pg2 psql -c "SELECT * FROM users;" │
│         ✅ Result: (1, 'Alice', ...)                   │
│         ✅ DATA VẪN CÒN (từ volume)!                   │
└─────────────────────────────────────────────────────────┘
```

### ✅ Ưu Điểm

```
✅ Data persist (lưu trữ lâu dài)
✅ Image size NHỎ (150MB)
✅ Multiple containers cùng dùng 1 volume
✅ Dễ backup (copy volume folder)
✅ Production-ready
✅ Stateless containers (best practice)
✅ Volume có thể exist sau khi container xóa
```

---

## 🎯 KẾT LUẬN

### Trường Hợp 1 (Commit)

```
Có commit → Image chứa data
├─ Data sẽ persist
├─ Nhưng image to (390MB)
└─ ⚠️ Không phải cách production dùng
```

### Trường Hợp 2 (Không Commit)

```
Không commit → Data mất khi remove container
├─ ❌ Không có data
├─ Image nhỏ (150MB)
└─ ❌ Data không persist
```

### Cách Tốt Nhất (Volumes)

```
Dùng volumes → Data persist + Image nhỏ + Production-ready
├─ ✅ Data sẽ persist
├─ ✅ Image nhỏ (150MB)
├─ ✅ Multiple containers share data
└─ ✅ Production best practice
```

---

## 💡 NHỚ CÓ ĐIỀU NÀY

```
┌──────────────────────────────────────────────┐
│ Docker Design Philosophy:                    │
│                                              │
│ Containers = Temporary, Stateless            │
│ Data = Should be outside containers          │
│ → Use Volumes, not committed images          │
│                                              │
│ ❌ DON'T: docker commit (data in image)     │
│ ✅ DO: Use volumes (data separated)         │
└──────────────────────────────────────────────┘
```

---

## 📝 QUICK REFERENCE

| Scenario          | Command                               | Data?    | Notes       |
| ----------------- | ------------------------------------- | -------- | ----------- |
| Commit method     | `docker commit pg1 image:v1`          | ✅ CÓ    | Large image |
| No commit         | `docker rm pg1`                       | ❌ KHÔNG | Data mất    |
| **Volume method** | `-v pg_data:/var/lib/postgresql/data` | ✅ CÓ    | ✅ BEST     |
| Bind mount        | `-v ./data:/var/lib/postgresql/data`  | ✅ CÓ    | ✅ GOOD     |

---

**TL;DR:**

- **CÓ Commit** → Data còn (nhưng image to, không good practice)
- **KHÔNG Commit** → Data mất
- **Dùng Volumes** → Data còn + Small image + Production-ready ✅
