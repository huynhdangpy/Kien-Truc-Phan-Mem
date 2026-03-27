# Service-Based Architecture Progression

## Overview

This document explains the architectural progression from Monolithic to Service-Based architecture.

## Phase 1: Monolithic Architecture

```
┌─────────────────────────────────────────┐
│          SINGLE APPLICATION             │
├─────────────────────────────────────────┤
│  Presentation Layer (Web UI)            │
│  Business Logic (All in one place)      │
│  Data Access (Direct to Database)       │
└──────────┬──────────────────────────────┘
           │
           ├──> Single Database
           └──> Single Server
```

**Characteristics:**

- All code in one application
- Shared database
- Hard to scale individual features
- Tight coupling between layers
- All-or-nothing deployment

---

## Phase 2: Layered Architecture (3 Functions)

```
┌─────────────────────────────────────────┐
│      Presentation Layer                 │
│      (Controller - HTTP Handling)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Business Logic Layer               │
│      (Service - Business Rules)         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Data Access Layer                  │
│      (Repository - Database Access)     │
└────────────────┬────────────────────────┘
                 │
           ┌─────▼──────┐
           │  Database  │
           └────────────┘
```

**Characteristics:**

- Separation of concerns
- Controller: Handles HTTP requests
- Service: Implements business logic
- Repository: Manages data persistence
- Easier to test each layer independently
- Better code organization

**Code Structure:**

```java
@RestController
class TaskController {
    // Handles API requests
}

@Service
class TaskService {
    // Contains business logic
}

@Repository
interface TaskRepository {
    // Data access operations
}
```

---

## Phase 3: Service-Based Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer                      │
└──────────────────┬───────────────────────────────────┬───────────────┘
                   │                                   │
        ┌──────────▼──────────┐         ┌──────────────▼──────────┐
        │  Task Service       │         │  User Service (Future)  │
        ├─────────────────────┤         ├─────────────────────────┤
        │ • Controller        │         │ • Controller            │
        │ • Service Layer     │         │ • Service Layer         │
        │ • Repository        │         │ • Repository            │
        └──────────┬──────────┘         └──────────┬──────────────┘
                   │                               │
        ┌──────────▼──────────┐         ┌──────────▼──────────┐
        │  Task Database      │         │  User Database      │
        └─────────────────────┘         └─────────────────────┘
```

**Characteristics:**

- Independent, loosely coupled services
- Each service has its own database
- Services communicate via REST APIs
- Easy to scale specific services
- Easy to update/deploy individual services
- Better for microservices migration

**Benefits:**

1. **Scalability**: Scale only the needed services
2. **Maintainability**: Each service is independently managed
3. **Flexibility**: Different services can use different technologies
4. **Resilience**: Failure in one service doesn't crash everything
5. **DevOps**: Independent deployment pipelines

---

## Current Implementation: Phase 3 (Service-Based)

### Project Structure Shows Phase 3 Principles:

#### 1. **Controller Layer** (Presentation)

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() { }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) { }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, ...) { }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) { }
}
```

#### 2. **Service Layer** (Business Logic)

```java
@Service
public class TaskServiceImpl implements TaskService {
    @Autowired
    private TaskRepository taskRepository;

    public Task createTask(Task task) {
        // Business validation
        // Business rules
        // Business calculations
        return taskRepository.save(task);
    }
}
```

#### 3. **Repository Layer** (Data Access)

```java
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(String status);
}
```

#### 4. **Database** (Single PostgreSQL)

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Comparison Table

| Aspect                    | Monolithic            | Layered (Phase 2)  | Service-Based (Phase 3)  |
| ------------------------- | --------------------- | ------------------ | ------------------------ |
| **Code Organization**     | Single module         | Organized by layer | Organized by service     |
| **Database**              | Single shared DB      | Single shared DB   | Service-specific DBs     |
| **Deployment**            | All-or-nothing        | All-or-nothing     | Independent deployment   |
| **Scalability**           | Limited               | Limited            | Easy per service         |
| **Dependency Management** | High coupling         | Medium coupling    | Low coupling             |
| **Testing**               | Difficult             | Medium             | Easy (isolated services) |
| **Development Speed**     | Fast (initially)      | Medium             | Medium (framework setup) |
| **Maintenance**           | Difficult (over time) | Medium             | Easy                     |

---

## Data Flow in Service-Based Architecture

### Request Processing Flow:

```
Frontend Request (Browser)
          ↓
    API Gateway
          ↓
    Task Service (REST)
          ↓
    TaskController (Handles HTTP)
          ↓
    TaskService (Business Logic)
          ↓
    TaskRepository (Data Access)
          ↓
    PostgreSQL Database
          ↓
    Response JSON
          ↓
    Frontend Display
```

---

## Technology Choices

### Backend: Spring Boot (Java)

- **Why?** Robust framework for enterprise applications
- **Features:**
  - Built-in dependency injection
  - JPA for data access
  - Auto-configuration
  - Easy REST API development

### Frontend: Vanilla JavaScript

- **Why?** Demonstrates service consumption
- **Features:**
  - No framework overhead
  - Pure HTTP communication
  - Modern ES6 syntax
  - CORS handling

### Database: PostgreSQL

- **Why?** Relational database, ACID compliance
- **Features:**
  - Strong consistency
  - JSON support
  - Full-text search
  - Geospatial queries

### Containerization: Docker

- **Why?** Consistent environments
- **Benefits:**
  - Same environment everywhere
  - Easy deployment
  - Service isolation
  - Resource management

---

## Migration Path: Monolithic → Service-Based

```
Step 1: Start with Monolithic
        ↓
Step 2: Organize into 3 layers
        • Controller
        • Service
        • Repository
        ↓
Step 3: Containerize the application
        • Docker
        • Docker Compose
        ↓
Step 4: Extract services (when needed)
        • User Service
        • Task Service
        • Notification Service
        ↓
Step 5: Add API Gateway
        • Route requests
        • Authentication
        • Rate limiting
        ↓
Step 6: Add message queues (optional)
        • Kafka/RabbitMQ
        • Async processing
        ↓
Final: Full microservices architecture
```

---

## Running the Service-Based Architecture

### Docker Compose Configuration:

```yaml
services:
  postgres: # Database Service
  backend: # Spring Boot Service
  frontend: # (Optional) Static files
```

### Service Independence:

1. Each service (postgres, backend) runs in a separate container
2. Services communicate via defined APIs
3. Database is independent of application code
4. Easy to scale/update individual services

---

## Key Principles Demonstrated

✅ **Separation of Concerns**

- Each layer has a single responsibility

✅ **Loose Coupling**

- Layers interact through well-defined interfaces

✅ **High Cohesion**

- Related functionality grouped together

✅ **DRY (Don't Repeat Yourself)**

- Business logic centralized in service layer

✅ **SOLID Principles**

- Single Responsibility (each class does one thing)
- Open/Closed (open for extension, closed for modification)
- Liskov Substitution (interfaces and implementations)
- Interface Segregation (focused interfaces)
- Dependency Inversion (depend on abstractions, not implementations)

---

## Future Enhancements

To make this truly service-based (microservices):

1. **Add API Gateway**
   - Kong, AWS API Gateway
   - Route and authenticate requests

2. **Extract More Services**
   - User Service (authentication)
   - Notification Service (emails)
   - Analytics Service (metrics)

3. **Add Message Queue**
   - RabbitMQ, Kafka
   - Async communication

4. **Add Service Discovery**
   - Consul, Eureka
   - Dynamic service registration

5. **Add Monitoring**
   - Prometheus, Grafana
   - Health checks and metrics

6. **Add Distributed Tracing**
   - Jaeger, Zipkin
   - Request tracking across services

---

## Conclusion

This project demonstrates the progression from basic architecture to service-based design:

- **Simplicity**: Easy to understand and develop
- **Maintainability**: Clear separation of concerns
- **Scalability**: Ready for microservices migration
- **Testability**: Each component can be tested independently

The Spring Boot service-based architecture provides a solid foundation for building scalable, maintainable applications.

---

**For more information, see [README.md](./README.md)**
