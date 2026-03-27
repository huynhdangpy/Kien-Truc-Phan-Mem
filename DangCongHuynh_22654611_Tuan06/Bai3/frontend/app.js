// API Configuration
const API_BASE_URL = "http://localhost:8080/api/tasks";

// State Management
let currentFilter = "ALL";
let allTasks = [];

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadTasks();
});

/**
 * Setup event listeners for form, buttons, and other interactions
 */
function setupEventListeners() {
  // Form submission
  document
    .getElementById("taskForm")
    .addEventListener("submit", handleCreateTask);

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", handleFilter);
  });
}

/**
 * Handle Create Task Form Submission
 */
async function handleCreateTask(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title) {
    showError("Please enter a task title");
    return;
  }

  const taskData = {
    title: title,
    description: description,
    status: "PENDING",
  };

  try {
    showLoading(true);
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (response.ok) {
      const newTask = await response.json();
      showSuccess("Task created successfully!");
      document.getElementById("taskForm").reset();
      allTasks.push(newTask);
      renderTasks();

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        document.getElementById("successMessage").style.display = "none";
      }, 3000);
    } else {
      showError("Failed to create task");
    }
  } catch (error) {
    console.error("Error creating task:", error);
    showError("Error creating task: " + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * Handle Filter Button Click
 */
function handleFilter(e) {
  // Remove active class from all buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Add active class to clicked button
  e.target.classList.add("active");

  // Update current filter and render
  currentFilter = e.target.dataset.status;
  renderTasks();
}

/**
 * Load all tasks from the backend
 */
async function loadTasks() {
  try {
    showLoading(true);
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to load tasks");
    }

    allTasks = await response.json();
    renderTasks();
  } catch (error) {
    console.error("Error loading tasks:", error);
    showError("Failed to load tasks");
  } finally {
    showLoading(false);
  }
}

/**
 * Render tasks based on current filter
 */
function renderTasks() {
  const tasksList = document.getElementById("tasksList");

  // Filter tasks based on current filter
  let filteredTasks = allTasks;
  if (currentFilter !== "ALL") {
    filteredTasks = allTasks.filter((task) => task.status === currentFilter);
  }

  // Clear the list
  tasksList.innerHTML = "";

  // Display empty state if no tasks
  if (filteredTasks.length === 0) {
    tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No tasks found</p>
            </div>
        `;
    return;
  }

  // Render each task
  filteredTasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    tasksList.appendChild(taskCard);
  });
}

/**
 * Create a task card element
 */
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";

  const taskDate = new Date(task.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  card.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
            <span class="task-status status-${task.status}">${task.status}</span>
        </div>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
        <div class="task-meta">
            Created: ${taskDate}
        </div>
        <div class="task-actions">
            <select class="status-select" onchange="handleStatusChange(${task.id}, this.value)">
                <option value="PENDING" ${task.status === "PENDING" ? "selected" : ""}>Pending</option>
                <option value="IN_PROGRESS" ${task.status === "IN_PROGRESS" ? "selected" : ""}>In Progress</option>
                <option value="COMPLETED" ${task.status === "COMPLETED" ? "selected" : ""}>Completed</option>
            </select>
            <button class="btn btn-danger" onclick="handleDeleteTask(${task.id})">Delete</button>
        </div>
    `;

  return card;
}

/**
 * Handle Status Change
 */
async function handleStatusChange(taskId, newStatus) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      const updatedTask = await response.json();

      // Update task in allTasks array
      const taskIndex = allTasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        allTasks[taskIndex] = updatedTask;
      }

      showSuccess("Task status updated!");
      renderTasks();

      setTimeout(() => {
        document.getElementById("successMessage").style.display = "none";
      }, 2000);
    } else {
      showError("Failed to update task status");
    }
  } catch (error) {
    console.error("Error updating task:", error);
    showError("Error updating task: " + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * Handle Delete Task
 */
async function handleDeleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Remove task from allTasks array
      allTasks = allTasks.filter((t) => t.id !== taskId);

      showSuccess("Task deleted successfully!");
      renderTasks();

      setTimeout(() => {
        document.getElementById("successMessage").style.display = "none";
      }, 2000);
    } else {
      showError("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    showError("Error deleting task: " + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * Show Error Message
 */
function showError(message) {
  const errorElement = document.getElementById("errorMessage");
  errorElement.textContent = message;
  errorElement.style.display = "block";

  setTimeout(() => {
    errorElement.style.display = "none";
  }, 5000);
}

/**
 * Show Success Message
 */
function showSuccess(message) {
  const successElement = document.getElementById("successMessage");
  successElement.textContent = message;
  successElement.style.display = "block";
}

/**
 * Show Loading Indicator
 */
function showLoading(isLoading) {
  const loadingElement = document.getElementById("loadingIndicator");
  loadingElement.style.display = isLoading ? "block" : "none";
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Optional: Refresh tasks every 30 seconds
setInterval(() => {
  if (currentFilter === "ALL") {
    loadTasks();
  }
}, 30000);
