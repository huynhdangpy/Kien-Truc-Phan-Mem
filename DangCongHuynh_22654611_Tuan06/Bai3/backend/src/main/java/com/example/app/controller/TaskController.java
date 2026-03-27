package com.example.app.controller;

import com.example.app.model.Task;
import com.example.app.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Task operations (Presentation Layer)
 * Handles HTTP requests and delegates to service layer
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * Get all tasks
     * GET /api/tasks
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        try {
            List<Task> tasks = taskService.getAllTasks();
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get task by ID
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        try {
            Optional<Task> task = taskService.getTaskById(id);
            return task.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by status
     * GET /api/tasks/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable String status) {
        try {
            List<Task> tasks = taskService.getTasksByStatus(status);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new task
     * POST /api/tasks
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        try {
            Task createdTask = taskService.createTask(task);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update task
     * PUT /api/tasks/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        try {
            Task updatedTask = taskService.updateTask(id, taskDetails);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete task
     * DELETE /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
