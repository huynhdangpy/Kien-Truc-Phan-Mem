// resourceServer.js - OAuth2 Resource Server
// Cung cấp các protected endpoints (yêu cầu token hợp lệ)

const express = require("express");
const { authMiddleware, authorizeMiddleware } = require("./authMiddleware");
const { login, refreshAccessToken, logout } = require("./authController");

const app = express();
app.use(express.json());

// ========== PUBLIC ENDPOINTS (Không cần token) ==========

/**
 * POST /auth/login
 * Đăng nhập lấy access token và refresh token
 * Body: { username, password }
 */
app.post("/auth/login", login);

/**
 * POST /auth/refresh
 * Lấy access token mới từ refresh token
 * Body: { refreshToken }
 */
app.post("/auth/refresh", refreshAccessToken);

/**
 * POST /auth/logout
 * Logout (revoke refresh token)
 * Body: { refreshToken }
 */
app.post("/auth/logout", logout);

// ========== PROTECTED ENDPOINTS (Yêu cầu Access Token) ==========

/**
 * GET /api/profile
 * Lấy thông tin profile người dùng (cần token)
 */
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Profile retrieved successfully",
    user: req.user,
  });
});

/**
 * GET /api/products
 * Lấy danh sách sản phẩm (cần token)
 */
app.get("/api/products", authMiddleware, (req, res) => {
  res.json({
    message: "Products list",
    products: [
      { id: 1, name: "Laptop", price: 999 },
      { id: 2, name: "Mouse", price: 25 },
      { id: 3, name: "Keyboard", price: 75 },
    ],
    requestedBy: req.user.username,
  });
});

/**
 * POST /api/admin/users
 * Tạo user mới (chỉ admin mới được)
 */
app.post(
  "/api/admin/users",
  authMiddleware,
  authorizeMiddleware(["admin"]),
  (req, res) => {
    res.json({
      message: "User created by admin",
      admin: req.user.username,
      newUser: req.body,
    });
  }
);

/**
 * DELETE /api/admin/users/:id
 * Xóa user (chỉ admin mới được)
 */
app.delete(
  "/api/admin/users/:id",
  authMiddleware,
  authorizeMiddleware(["admin"]),
  (req, res) => {
    res.json({
      message: `User ${req.params.id} deleted`,
      deletedBy: req.user.username,
    });
  }
);

/**
 * GET /api/orders
 * Lấy danh sách orders của người dùng
 */
app.get("/api/orders", authMiddleware, (req, res) => {
  res.json({
    message: "Orders retrieved",
    orders: [
      { id: 1, product: "Laptop", status: "Shipped" },
      { id: 2, product: "Mouse", status: "Delivered" },
    ],
    user: req.user.username,
  });
});

// ========== ERROR HANDLING ==========

/**
 * Endpoint không tồn tại
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "This endpoint does not exist",
  });
});

// ========== START SERVER ==========

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🔒 OAuth2 Resource Server running on port ${PORT}`);
  console.log("\n📝 Test URLs:");
  console.log("   POST   http://localhost:3002/auth/login");
  console.log("   POST   http://localhost:3002/auth/refresh");
  console.log("   POST   http://localhost:3002/auth/logout");
  console.log("   GET    http://localhost:3002/api/profile");
  console.log("   GET    http://localhost:3002/api/products");
  console.log("   GET    http://localhost:3002/api/orders");
  console.log("   POST   http://localhost:3002/api/admin/users");
  console.log("   DELETE http://localhost:3002/api/admin/users/:id");
  console.log("\n🧪 Test Users:");
  console.log("   Admin: username=admin, password=admin123, role=admin");
  console.log("   User:  username=user,  password=user123,  role=user");
});

module.exports = app;
