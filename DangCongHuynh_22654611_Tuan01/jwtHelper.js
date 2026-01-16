// jwtHelper.js - Utility để tạo và verify JWT tokens
const jwt = require("jsonwebtoken");

// Secret keys (trong production, lấy từ environment variables)
const ACCESS_TOKEN_SECRET = "your_access_token_secret_key_123";
const REFRESH_TOKEN_SECRET = "your_refresh_token_secret_key_456";

// ===== TẠO TOKEN =====

/**
 * Tạo Access Token (thời hạn ngắn: 15 phút)
 * @param {Object} payload - Dữ liệu token (user info, roles...)
 * @returns {string} Access Token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

/**
 * Tạo Refresh Token (thời hạn dài: 7 ngày)
 * @param {Object} payload - Dữ liệu token
 * @returns {string} Refresh Token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// ===== VERIFY TOKEN =====

/**
 * Kiểm tra Access Token có hợp lệ không
 * @param {string} token - Access Token cần kiểm tra
 * @returns {Object|null} Decoded payload hoặc null nếu invalid
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.error("Access Token verification failed:", error.message);
    return null;
  }
}

/**
 * Kiểm tra Refresh Token có hợp lệ không
 * @param {string} token - Refresh Token cần kiểm tra
 * @returns {Object|null} Decoded payload hoặc null nếu invalid
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.error("Refresh Token verification failed:", error.message);
    return null;
  }
}

// ===== GIẢI MÃ TOKEN =====

/**
 * Giải mã token mà không verify (chỉ xem nội dung)
 * @param {string} token - Token cần giải mã
 * @returns {Object} Decoded token
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Token decode failed:", error.message);
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
