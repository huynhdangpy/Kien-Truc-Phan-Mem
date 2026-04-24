package com.cqrs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Main Application Class
 * 
 * Spring Boot Application Entry Point
 * 
 * Cấu hình:
 * - Auto-configuration: Spring tự động cấu hình beans
 * - Component Scan: Quét các @Component, @Service, @Repository, @Controller
 * - RabbitMQ: Auto-configure từ spring-boot-starter-amqp
 * - Redis: Auto-configure từ spring-boot-starter-data-redis
 */
@SpringBootApplication
public class CqrsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CqrsApplication.class, args);
    }
}
