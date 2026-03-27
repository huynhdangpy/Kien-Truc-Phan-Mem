# Service-Based Architecture with Spring Boot

## Project Overview

This project demonstrates a **Service-Based Architecture** progression:

- **Phase 1**: Monolithic (Single Module) → Traditional single application
- **Phase 2**: 3 Functional Layers → Separation of concerns (Controller, Service, Repository)
- **Phase 3**: Service-Based Architecture → Independent services with clear boundaries

## Architecture Components

### 1. **Database Layer (PostgreSQL)**

- **File**: `init.sql`
- **Tables**: tasks table with status filtering
- Persistent data storage layer

### 2. **Backend Service (Spring Boot)**

- **Framework**: Spring Boot 3.1.5
- **Language**: Java 17

#### Layer Separation:

```
Controller Layer (REST API)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
```

#### Components:

| Component                | Purpose                                 |
| ------------------------ | --------------------------------------- |
| **TaskController.java**  | REST API endpoints - Presentation Layer |
| **TaskService.java**     | Interface defining business operations  |
| **TaskServiceImpl.java** | Business logic implementation           |
| **TaskRepository.java**  | Data access layer using JPA             |
| **Task.java**            | Entity model representing domain object |

### 3. **Frontend (HTML/CSS/JavaScript)**

- **Files**: `index.html`, `style.css`, `app.js`
- Modern, responsive UI with real-time task management
- CORS-enabled communication with backend

## Key Features

### REST API Endpoints

| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| GET    | `/api/tasks`                 | Retrieve all tasks |
| GET    | `/api/tasks/{id}`            | Get task by ID     |
| GET    | `/api/tasks/status/{status}` | Filter by status   |
| POST   | `/api/tasks`                 | Create new task    |
| PUT    | `/api/tasks/{id}`            | Update task        |
| DELETE | `/api/tasks/{id}`            | Delete task        |

### Task Statuses

- **PENDING**: New task (default)
- **IN_PROGRESS**: Currently being worked on
- **COMPLETED**: Finished task

## Project Structure

```
Bai3/
├── backend/
│   ├── pom.xml                          # Maven configuration
│   └── src/main/java/com/example/app/
│       ├── Application.java              # Main Spring Boot entry point
│       ├── controller/
│       │   └── TaskController.java       # REST API endpoints
│       ├── service/
│       │   ├── TaskService.java          # Service interface
│       │   └── TaskServiceImpl.java       # Service implementation (Business Logic)
│       ├── repository/
│       │   └── TaskRepository.java       # Data access layer
│       └── model/
│           └── Task.java                 # JPA entity
│   └── src/main/resources/
│       └── application.properties        # Spring Boot configuration
│
├── frontend/
│   ├── index.html                        # Main HTML page
│   ├── style.css                         # Styling (responsive design)
│   └── app.js                            # Frontend logic & API calls
│
├── docker-compose.yml                    # Orchestrate services
├── Dockerfile.backend                    # Build backend container
├── Dockerfile.frontend                   # Build frontend container
├── init.sql                              # Database initialization script
└── README.md                             # This file
```

## Technology Stack

| Layer                | Technology                      |
| -------------------- | ------------------------------- |
| **Database**         | PostgreSQL 15                   |
| **Backend**          | Spring Boot 3.1.5, Java 17      |
| **Frontend**         | HTML5, CSS3, Vanilla JavaScript |
| **Containerization** | Docker, Docker Compose          |
| **Build Tool**       | Maven                           |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Java 17 & Maven for local development

### Using Docker Compose

```bash
# Navigate to Bai3 directory
cd Bai3

# Start all services
docker-compose up -d

# Wait for services to initialize (30-40 seconds)

# Access the application
# Frontend: Open browser and navigate to frontend container (check docker output)
# Backend API: http://localhost:8080/api/tasks
# Database: localhost:5432 (user: postgres, password: postgres)
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down

# Remove volumes (optional - if you want to reset database)
docker-compose down -v
```

## Local Development (Without Docker)

### 1. Setup Database

```bash
# Install PostgreSQL
# Create database
createdb taskdb

# Run init.sql
psql -U postgres -d taskdb -f init.sql
```

### 2. Run Backend

```bash
cd backend

# Build project
mvn clean install

# Run application
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080`

### 3. Run Frontend

```bash
cd frontend

# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx http-server -p 8000

# Option 3: Using PHP
php -S localhost:8000
```

Frontend will be available at: `http://localhost:8000`

## Service-Based Architecture Benefits

### 1. **Separation of Concerns**

- Each layer has a specific responsibility
- Controller: Handle HTTP requests
- Service: Implement business logic
- Repository: Manage data access

### 2. **Reusability**

- Service layer can be used by multiple controllers
- Business logic independent of presentation

### 3. **Testability**

- Each layer can be unit tested independently
- Mock dependencies easily
- Service layer can be tested without HTTP layer

### 4. **Maintainability**

- Clear structure makes code navigation easier
- Changes in one layer don't affect others
- Database changes isolated to repository layer

### 5. **Scalability**

- Services can be deployed independently
- Database can be optimized separately
- Frontend can be cached/served from CDN

## API Usage Examples

### Create Task

```javascript
POST /api/tasks
Content-Type: application/json

{
  "title": "Learn Spring Boot",
  "description": "Study service-based architecture",
  "status": "PENDING"
}
```

### Update Task Status

```javascript
PUT /api/tasks/1
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Filter by Status

```javascript
GET / api / tasks / status / COMPLETED;
```

## Database Schema

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_status ON tasks(status);
```

## Configuration

### Backend Configuration (`application.properties`)

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://postgres:5432/taskdb
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
```

### Frontend Configuration (`app.js`)

```javascript
const API_BASE_URL = "http://localhost:8080/api/tasks";
```

## Common Issues & Solutions

### 1. Database Connection Failed

- Ensure PostgreSQL is running
- Check credentials in `application.properties`
- Verify database exists: `createdb taskdb`

### 2. CORS Errors

- Ensure `@CrossOrigin` annotation is set in controller
- Check frontend API_BASE_URL matches backend URL

### 3. Port Already in Use

- Change port in `application.properties`
- Or kill process using the port

### 4. Frontend not updating

- Check browser console for errors
- Verify backend API is responding
- Check network requests in DevTools

## Learning Outcomes

After studying this project, you will understand:

1. ✅ Spring Boot project structure and configuration
2. ✅ Service-based architecture principles
3. ✅ REST API design and implementation
4. ✅ JPA/Hibernate for database operations
5. ✅ Separation of concerns (Controller, Service, Repository)
6. ✅ Frontend-Backend communication
7. ✅ Docker containerization
8. ✅ HTTP methods and status codes
9. ✅ Async JavaScript and API calls
10. ✅ Database design and normalization

## Next Steps (Advanced)

- Add authentication (JWT, OAuth2)
- Implement pagination and sorting
- Add logging and monitoring
- Write unit and integration tests
- Deploy to cloud (AWS, Azure, GCP)
- Add caching layer (Redis)
- Implement API versioning
- Add API documentation (Swagger/OpenAPI)

## Author & Course

**Course**: Architecture & Software Design  
**Assignment**: Bài 3 - Service-based Architecture  
**Date**: 2024

---

**Happy Learning!** 🚀
