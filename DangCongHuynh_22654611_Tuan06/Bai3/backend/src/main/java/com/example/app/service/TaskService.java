package com.example.app.service;

import com.example.app.model.Task;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for Task operations (Service Layer)
 * Defines the business logic operations
 */
public interface TaskService {
    Task createTask(Task task);

    Optional<Task> getTaskById(Long id);

    List<Task> getAllTasks();

    List<Task> getTasksByStatus(String status);

    Task updateTask(Long id, Task task);

    void deleteTask(Long id);
}
