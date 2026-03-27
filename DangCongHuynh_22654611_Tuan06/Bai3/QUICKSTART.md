# Quick Start Guide - Bai3 Service-Based Architecture

## ⚡ Quick Facts

| Component            | Details                 |
| -------------------- | ----------------------- |
| **Language**         | Java (Spring Boot)      |
| **Frontend**         | HTML, CSS, JavaScript   |
| **Database**         | PostgreSQL              |
| **Containerization** | Docker & Docker Compose |
| **Build Tool**       | Maven                   |

---

## 🚀 Quick Start (Docker Compose - Recommended)

### Option 1: Windows PowerShell

```powershell
# Navigate to Bai3 directory
cd "D:\Me\Study\HK2_Nam4\Kien truc phan mem\DangCongHuynh_22654611_KienTrucPhanMem\DangCongHuynh_22654611_Tuan06\Bai3"

# Start all services (PostgreSQL, Spring Boot Backend)
docker-compose up -d

# Wait 30-40 seconds for services to initialize

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Option 2: Command Prompt (CMD)

```cmd
cd D:\Me\Study\HK2_Nam4\Kien truc phan mem\DangCongHuynh_22654611_KienTrucPhanMem\DangCongHuynh_22654611_Tuan06\Bai3
docker-compose up -d
docker-compose ps
```

---

## 🌐 Accessing the Application

### Backend API

- **URL**: [http://localhost:8080/api/tasks](http://localhost:8080/api/tasks)
- **Test**: Open in browser or use Postman

### Frontend

- **Option 1**: Serve frontend from any HTTP server (see Manual Frontend Setup below)
- **Option 2**: Access via backend static files (if configured)

### Database

- **Host**: localhost
- **Port**: 5432
- **Database**: taskdb
- **Username**: postgres
- **Password**: postgres
- **Tool**: Use pgAdmin, DBeaver, or `psql` CLI

---

## 📝 Manual Setup (Without Docker)

### Prerequisites

- Java JDK 17 or higher
- Maven 3.8+
- PostgreSQL 15+
- Node.js (for frontend server)

### Step 1: Setup Database

```powershell
# Create database
createdb -U postgres taskdb

# Initialize schema
psql -U postgres -d taskdb -f init.sql
```

### Step 2: Run Backend

```powershell
cd backend

# Build project
mvn clean install

# Run Spring Boot application
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

### Step 3: Run Frontend

#### Option A: Python HTTP Server

```powershell
cd frontend
python -m http.server 8000
```

#### Option B: Node.js HTTP Server

```powershell
cd frontend
npx http-server -p 8000
```

#### Option C: npm http-server

```powershell
cd frontend
npm install -g http-server
http-server -p 8000
```

Frontend will be available at `http://localhost:8000`

---

## 📊 Project Structure

```
Bai3/
├── backend/
│   ├── src/
│   │   ├── main/java/com/example/app/
│   │   │   ├── Application.java          # Main entry point
│   │   │   ├── controller/
│   │   │   │   └── TaskController.java   # REST APIs
│   │   │   ├── service/
│   │   │   │   ├── TaskService.java      # Interface
│   │   │   │   └── TaskServiceImpl.java   # Implementation (Business Logic)
│   │   │   ├── repository/
│   │   │   │   └── TaskRepository.java   # Data access
│   │   │   └── model/
│   │   │       └── Task.java             # Entity
│   │   └── resources/
│   │       └── application.properties    # Config
│   └── pom.xml                           # Maven dependencies
│
├── frontend/
│   ├── index.html                        # Main UI
│   ├── style.css                         # Styling (responsive)
│   └── app.js                            # JavaScript logic
│
├── docker-compose.yml                    # Service orchestration
├── Dockerfile.backend                    # Backend container
├── Dockerfile.frontend                   # Frontend container (optional)
├── init.sql                              # Database setup
├── README.md                             # Full documentation
└── ARCHITECTURE.md                       # Architecture explanation
```

---

## 🔌 REST API Endpoints

### Get All Tasks

```bash
curl http://localhost:8080/api/tasks
```

### Get Single Task

```bash
curl http://localhost:8080/api/tasks/1
```

### Get Tasks by Status

```bash
curl http://localhost:8080/api/tasks/status/PENDING
```

### Create Task

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Spring Boot",
    "description": "Study service-based architecture",
    "status": "PENDING"
  }'
```

### Update Task

```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "IN_PROGRESS"
  }'
```

### Delete Task

```bash
curl -X DELETE http://localhost:8080/api/tasks/1
```

---

## 🛠️ Common Commands

### Docker Compose Commands

```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Rebuild containers
docker-compose up -d --build

# Remove volumes (CAUTION: Deletes data)
docker-compose down -v

# Restart services
docker-compose restart

# Check service status
docker-compose ps
```

### Individual Container Commands

```powershell
# Exec into backend container
docker exec -it backend-app sh

# Exec into postgres container
docker exec -it taskdb psql -U postgres -d taskdb

# View container logs
docker logs backend-app
docker logs taskdb

# Stop specific container
docker stop backend-app
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" when accessing API

**Solution:**

```powershell
# Check if containers are running
docker-compose ps

# If not running, start them
docker-compose up -d

# Wait 30-40 seconds for initialization
# Check logs
docker-compose logs backend
```

### Issue: "Port 8080 already in use"

**Solution:**

```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with the actual PID)
taskkill /PID <PID> /F

# Or change port in application.properties
# server.port=8081
```

### Issue: "PostgreSQL connection error"

**Solution:**

```powershell
# Check if postgres container is running
docker-compose logs postgres

# Ensure database is created
docker exec taskdb psql -U postgres -l

# Check credentials in application.properties
```

### Issue: "CORS error in frontend"

**Solution:**

- Ensure `@CrossOrigin` is set in TaskController.java
- Update `API_BASE_URL` in app.js if using different port
- Check browser console for actual error

### Issue: Frontend not loading

**Solution:**

```powershell
# Check frontend server is running
# Try accessing http://localhost:3000 or http://localhost:8000

# Or serve frontend from backend
# Copy frontend/ to src/main/resources/static/
```

---

## 📚 Learning Resources

### Files to Study (in order):

1. **ARCHITECTURE.md** - Understand the progression
2. **Task.java** - Data model
3. **TaskRepository.java** - Data access
4. **TaskService.java & TaskServiceImpl.java** - Business logic
5. **TaskController.java** - API endpoints
6. **app.js** - Frontend logic
7. **docker-compose.yml** - Service orchestration

### Key Concepts:

- **Controller**: Handles HTTP requests/responses
- **Service**: Contains business logic and validation
- **Repository**: Manages database operations
- **DTOs**: Data Transfer Objects (not used here, simple entities)
- **REST**: Representational State Transfer (API design)
- **CRUD**: Create, Read, Update, Delete operations

---

## ✅ Verification Checklist

After starting the application:

- [ ] Backend API responds at `http://localhost:8080/api/tasks`
- [ ] Database connected (check logs)
- [ ] Can create new task via API
- [ ] Can retrieve tasks
- [ ] Can update task status
- [ ] Can delete task
- [ ] Frontend loads and displays tasks
- [ ] Frontend can create/update/delete tasks

---

## 🔄 Development Workflow

### Making Changes:

```powershell
# 1. Make code changes

# 2. If only backend changes:
docker-compose restart backend

# 3. If database changes:
docker-compose down -v
docker-compose up -d

# 4. If only frontend changes:
# Reload browser (no restart needed)

# 5. View logs to debug
docker-compose logs -f backend
```

---

## 📦 Stopping & Cleanup

```powershell
# Stop all services (keeps data)
docker-compose down

# Stop and remove everything (including data)
docker-compose down -v

# Remove specific container
docker-compose rm backend

# Clean up unused images
docker image prune -a
```

---

## 🚀 Performance Tips

1. **Database Indexing**: Already added index on status field
2. **Caching**: Frontend auto-refreshes every 30 seconds
3. **Pagination**: Not implemented, consider adding for large datasets
4. **Compression**: Enable GZIP in Spring Boot production

---

## 📞 Support

For detailed documentation, see:

- **[README.md](./README.md)** - Full project documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture details
- **Code comments** - Each file has inline documentation

---

## 🎯 Next Steps

1. ✅ Run the application
2. ✅ Test the API endpoints
3. ✅ Explore the code structure
4. ✅ Modify and experiment
5. ✅ Add more features (authentication, pagination, etc.)

---

**Happy Coding!** 🎉

Created for: **Software Architecture Course - Week 6**  
Date: 2024
