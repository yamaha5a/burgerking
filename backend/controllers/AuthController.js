const User = require("../models/User");

/**
 * Đăng nhập - chỉ email + mật khẩu (MongoDB collection users)
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

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const userObj = user.toObject();
    const { password: _, ...userSafe } = userObj;
    res.json({ success: true, user: userSafe });
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
