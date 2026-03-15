const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Đăng nhập - email + mật khẩu
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // Ở đây đang so sánh plain-text do hệ thống cũ chưa hash mật khẩu
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userObj = user.toObject();
    const { password: _, ...userSafe } = userObj;

    res.json({
      success: true,
      user: userSafe,
      token,
    });
  } catch (err) {
    console.error("Auth login error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
    });
  }
};

module.exports = {
  login,
};
