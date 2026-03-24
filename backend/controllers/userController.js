const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// GET /api/users
// Query: page, limit, search, sort (newest|oldest)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search = "", sort = "newest" } = req.query;

    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { email: regex },
        { username: regex },
        { phone: regex },
      ];
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select("-password -__v"),
    ]);

    res.json({
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách người dùng" });
  }
};

// GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching my profile:", err);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin cá nhân" });
  }
};

// PUT /api/users/me/change-password
const changeMyPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    user.password = String(newPassword);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
  }
};

// PUT /api/users/me
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const { username, email, phone, address } = req.body || {};

    if (username !== undefined) user.username = String(username).trim();
    if (email !== undefined) user.email = String(email).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "subnautica/avatars",
      });
      user.avatar = uploadResult.secure_url;
    }

    await user.save();
    const safeUser = await User.findById(user._id).select("-password -__v");
    res.json({ message: "Cập nhật thông tin thành công", user: safeUser });
  } catch (err) {
    console.error("Error updating my profile:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật thông tin cá nhân" });
  }
};

module.exports = {
  getUsers,
  getMyProfile,
  changeMyPassword,
  updateMyProfile,
};

