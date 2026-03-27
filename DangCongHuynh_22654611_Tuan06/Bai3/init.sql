-- Initialize Database Schema
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Insert sample data
INSERT INTO tasks (title, description, status) VALUES
('Setup Spring Boot Project', 'Initialize Spring Boot project structure', 'COMPLETED'),
('Create Database Schema', 'Design and create PostgreSQL database schema', 'COMPLETED'),
('Implement Service Layer', 'Implement TaskService with business logic', 'IN_PROGRESS'),
('Build REST Controller', 'Create REST endpoints for API', 'IN_PROGRESS'),
('Develop Frontend', 'Create HTML/CSS/JavaScript frontend', 'PENDING'),
('Write Unit Tests', 'Write comprehensive unit tests', 'PENDING');
