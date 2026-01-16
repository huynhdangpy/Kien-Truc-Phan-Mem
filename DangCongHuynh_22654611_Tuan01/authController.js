// authController.js - Controller xử lý login và token refresh
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("./jwtHelper");

// Giả lập user database (trong thực tế dùng database thật)
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
];

// Lưu refresh tokens (trong thực tế dùng Redis hoặc database)
const refreshTokens = [];

/**
 * POST /auth/login
 * Đăng nhập và trả về access token + refresh token
 */
function login(req, res) {
  try {
    const { username, password } = req.body;

    // Kiểm tra user tồn tại
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      return res.status(401).json({
        error: "Authentication Failed",
        message: "Username or password is incorrect",
      });
    }

    // Tạo payload cho token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // Tạo tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Lưu refresh token (để có thể revoke sau)
    refreshTokens.push(refreshToken);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed", message: error.message });
  }
}

/**
 * POST /auth/refresh
 * Dùng refresh token để lấy access token mới
 */
function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Refresh token is required",
      });
    }

    // Kiểm tra refresh token đã bị revoke chưa
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({
        error: "Invalid Token",
        message: "Refresh token is invalid or revoked",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({
        error: "Invalid Token",
        message: "Refresh token is expired",
      });
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    });

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Token refresh failed", message: error.message });
  }
}

/**
 * POST /auth/logout
 * Revoke refresh token (logout)
 */
function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Refresh token is required",
      });
    }

    // Xóa refresh token khỏi danh sách
    const index = refreshTokens.indexOf(refreshToken);
    if (index > -1) {
      refreshTokens.splice(index, 1);
    }

    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", message: error.message });
  }
}

module.exports = {
  login,
  refreshAccessToken,
  logout,
};
