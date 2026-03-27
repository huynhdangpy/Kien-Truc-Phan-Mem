package com.example.app.service;

import com.example.app.model.Task;
import com.example.app.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * TaskService Implementation (Service Layer - Business Logic)
 * Implements the CRUD operations and business logic for tasks
 */
@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public Task createTask(Task task) {
        // Business logic: validate and create task
        if (task.getTitle() == null || task.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Task title cannot be empty");
        }
        task.setStatus("PENDING");
        return taskRepository.save(task);
    }

    @Override
    public Optional<Task> getTaskById(Long id) {
        // Business logic: retrieve single task
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid task ID");
        }
        return taskRepository.findById(id);
    }

    @Override
    public List<Task> getAllTasks() {
        // Business logic: retrieve all tasks
        return taskRepository.findAll();
    }

    @Override
    public List<Task> getTasksByStatus(String status) {
        // Business logic: retrieve tasks by status
        if (status == null || status.isEmpty()) {
            throw new IllegalArgumentException("Status cannot be empty");
        }
        return taskRepository.findByStatus(status);
    }

    @Override
    public Task updateTask(Long id, Task taskDetails) {
        // Business logic: update existing task
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid task ID");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + id));

        if (taskDetails.getTitle() != null) {
            task.setTitle(taskDetails.getTitle());
        }
        if (taskDetails.getDescription() != null) {
            task.setDescription(taskDetails.getDescription());
        }
        if (taskDetails.getStatus() != null) {
            task.setStatus(taskDetails.getStatus());
        }

        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long id) {
        // Business logic: delete task
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid task ID");
        }

        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with ID: " + id);
        }

        taskRepository.deleteById(id);
    }
}
