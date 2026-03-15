const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Xác thực token, gắn user vào req.user
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "Tài khoản không tồn tại" });
    }

    req.user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ success: false, message: "Phiên đăng nhập không hợp lệ" });
  }
}

// Chỉ cho admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập (admin only)",
    });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};

