/**
 * REST API Example - Users & Posts Management
 * Node.js + Express
 *
 * Khái niệm: REST (Representational State Transfer)
 * - Sử dụng HTTP methods (GET, POST, PUT, DELETE)
 * - Resource-oriented architecture
 * - Stateless communication
 */

const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// IN-MEMORY DATA (use database in production)
// ============================================
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

let posts = [
  { id: 1, userId: 1, title: "First Post", content: "Hello REST API" },
  { id: 2, userId: 1, title: "Second Post", content: "RESTful design" },
  { id: 3, userId: 2, title: "Bob's Post", content: "Learning REST" },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate next ID
 */
const getNextId = (array) => {
  return array.length === 0 ? 1 : Math.max(...array.map((item) => item.id)) + 1;
};

/**
 * Error response helper
 */
const errorResponse = (res, status, message) => {
  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Success response helper
 */
const successResponse = (res, status, data, message = null) => {
  res.status(status).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

// ============================================
// USERS ENDPOINTS
// ============================================

/**
 * GET /api/users
 * Retrieve all users
 * Query parameters: ?limit=10&offset=0
 */
app.get("/api/users", (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const paginatedUsers = users.slice(
    parseInt(offset),
    parseInt(offset) + parseInt(limit),
  );

  res.json({
    data: paginatedUsers,
    total: users.length,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
});

/**
 * GET /api/users/:id
 * Retrieve a single user by ID
 */
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  res.json({ data: user });
});

/**
 * POST /api/users
 * Create a new user
 * Body: { name: string, email: string }
 */
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  // Validation
  if (!name || !email) {
    return errorResponse(res, 400, "Name and email are required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse(res, 400, "Invalid email format");
  }

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    return errorResponse(res, 409, "Email already exists");
  }

  const newUser = {
    id: getNextId(users),
    name: name.trim(),
    email: email.toLowerCase(),
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser,
    message: "User created successfully",
  });
});

/**
 * PUT /api/users/:id
 * Update an existing user
 * Body: { name?: string, email?: string }
 */
app.put("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  const { name, email } = req.body;

  // Validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse(res, 400, "Invalid email format");
  }

  if (email && email !== user.email && users.some((u) => u.email === email)) {
    return errorResponse(res, 409, "Email already exists");
  }

  // Update fields
  if (name) user.name = name.trim();
  if (email) user.email = email.toLowerCase();

  res.json({
    success: true,
    data: user,
    message: "User updated successfully",
  });
});

/**
 * PATCH /api/users/:id
 * Partial update of user (same as PUT but semantic difference)
 */
app.patch("/api/users/:id", (req, res) => {
  // Same implementation as PUT
  const user = users.find((u) => u.id === parseInt(req.params.id));

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  const { name, email } = req.body;

  if (name) user.name = name.trim();
  if (email) user.email = email.toLowerCase();

  res.json({ data: user });
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
app.delete("/api/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));

  if (index === -1) {
    return errorResponse(res, 404, "User not found");
  }

  const deletedUser = users.splice(index, 1)[0];

  // Also delete user's posts
  posts = posts.filter((p) => p.userId !== deletedUser.id);

  res.json({
    success: true,
    data: deletedUser,
    message: "User deleted successfully",
  });
});

// ============================================
// POSTS ENDPOINTS
// ============================================

/**
 * GET /api/posts
 * Retrieve all posts with optional filtering
 * Query: ?userId=1&sort=date
 */
app.get("/api/posts", (req, res) => {
  let result = [...posts];

  // Filter by userId
  if (req.query.userId) {
    result = result.filter((p) => p.userId === parseInt(req.query.userId));
  }

  // Sort
  if (req.query.sort === "date") {
    result.sort((a, b) => b.id - a.id);
  }

  res.json({ data: result, total: result.length });
});

/**
 * GET /api/posts/:id
 * Get a single post
 */
app.get("/api/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));

  if (!post) {
    return errorResponse(res, 404, "Post not found");
  }

  res.json({ data: post });
});

/**
 * GET /api/users/:userId/posts
 * Get all posts of a specific user
 */
app.get("/api/users/:userId/posts", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  const userPosts = posts.filter((p) => p.userId === userId);
  res.json({ data: userPosts, total: userPosts.length });
});

/**
 * POST /api/posts
 * Create a new post
 * Body: { userId: number, title: string, content: string }
 */
app.post("/api/posts", (req, res) => {
  const { userId, title, content } = req.body;

  if (!userId || !title || !content) {
    return errorResponse(res, 400, "userId, title, and content are required");
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  const newPost = {
    id: getNextId(posts),
    userId,
    title: title.trim(),
    content: content.trim(),
  };

  posts.push(newPost);

  res.status(201).json({
    success: true,
    data: newPost,
    message: "Post created successfully",
  });
});

/**
 * PUT /api/posts/:id
 * Update a post
 */
app.put("/api/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));

  if (!post) {
    return errorResponse(res, 404, "Post not found");
  }

  const { title, content } = req.body;

  if (title) post.title = title.trim();
  if (content) post.content = content.trim();

  res.json({
    success: true,
    data: post,
    message: "Post updated successfully",
  });
});

/**
 * DELETE /api/posts/:id
 * Delete a post
 */
app.delete("/api/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1) {
    return errorResponse(res, 404, "Post not found");
  }

  const deletedPost = posts.splice(index, 1)[0];

  res.json({
    success: true,
    data: deletedPost,
    message: "Post deleted successfully",
  });
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log(`║ REST API Server running at http://localhost:${PORT} ║`);
  console.log("║                                                  ║");
  console.log("║ Example Requests:                                ║");
  console.log("║ - GET /api/users                                 ║");
  console.log("║ - GET /api/users/1                               ║");
  console.log("║ - POST /api/users                                ║");
  console.log("║ - GET /api/posts                                 ║");
  console.log("║ - GET /api/users/1/posts                         ║");
  console.log("╚══════════════════════════════════════════════════╝");
});

module.exports = app;
