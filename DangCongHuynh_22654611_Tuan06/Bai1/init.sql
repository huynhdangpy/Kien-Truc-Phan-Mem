-- PostgreSQL initialization script
-- Được chạy tự động khi container khởi động lần đầu
-- File này cần được copy vào /docker-entrypoint-initdb.d/ trong container

-- Create database (nếu cần)
-- CREATE DATABASE mydb; -- (POSTGRES_DB đã được tạo bởi env variable)

-- Create table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Charlie Brown', 'charlie@example.com');

INSERT INTO products (title, price) VALUES
    ('Laptop', 999.99),
    ('Mouse', 29.99),
    ('Keyboard', 79.99),
    ('Monitor', 299.99);

-- Verify data
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;
