// authMiddleware.js - Middleware để xác thực JWT tokens
const { verifyAccessToken } = require("./jwtHelper");

/**
 * Middleware kiểm tra Access Token
 * Nếu token hợp lệ: thêm user info vào req.user
 * Nếu token không hợp lệ: trả về 401 Unauthorized
 */
function authMiddleware(req, res, next) {
  // Lấy token từ header: "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Lấy phần sau "Bearer "

  if (!token) {
    return res.status(401).json({
      error: "Access Denied",
      message: "No token provided",
    });
  }

  // Verify token
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({
      error: "Invalid Token",
      message: "Token is invalid or expired",
    });
  }

  // Token hợp lệ: lưu user info vào req để dùng trong controller
  req.user = decoded;
  next();
}

/**
 * Middleware kiểm tra quyền (role-based authorization)
 * @param {Array} allowedRoles - Danh sách các role được phép
 */
function authorizeMiddleware(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access Forbidden",
        message: `Required role: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  authorizeMiddleware,
};
