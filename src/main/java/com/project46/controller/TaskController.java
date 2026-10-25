
package com.project46.controller;

import com.project46.model.Task;
import com.project46.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"})
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // GET: Retrieve all tasks
    @GetMapping
    public List<Task> getTasks() {
        return taskRepository.findAll();
    }

    // POST: Create a task
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        task.setId(null);
        return taskRepository.save(task);
    }

    // PUT: Update an existing task
    @PutMapping("/{id}")
    public Task updateTask(
            @PathVariable Long id,
            @RequestBody Task updatedTask) {

        Task existingTask = findTask(id);

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setCompleted(updatedTask.isCompleted());

        return taskRepository.save(existingTask);
    }

    // DELETE: Remove a task
    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id) {
        Task task = findTask(id);
        taskRepository.delete(task);

        return "Task " + id + " deleted successfully";
    }

    // Find a task or return HTTP 404
    private Task findTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Task not found"));
    }
}
