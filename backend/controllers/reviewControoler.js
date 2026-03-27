const Review = require("../models/reviewModel");
const Bill = require("../models/billModel");
const Product = require("../models/productModel");
const User = require("../models/User");

const normalizeRating = (rating) => {
  const n = Number(rating);
  if (Number.isNaN(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
};

const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ message: "Thiếu productId" });

    const reviews = await Review.find({ productId, isHidden: { $ne: true } })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 })
      .lean();

    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length;

    res.json({
      items: reviews,
      total: reviews.length,
      averageRating: Number(avg.toFixed(2)),
    });
  } catch (err) {
    console.error("Error getReviewsByProduct:", err);
    res.status(500).json({ message: "Lỗi server khi lấy đánh giá" });
  }
};

const upsertMyReview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId, content, rating } = req.body || {};

    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    if (!productId) return res.status(400).json({ message: "Thiếu productId" });

    const r = normalizeRating(rating);
    if (!r) return res.status(400).json({ message: "Số sao phải từ 1 đến 5" });

    const text = String(content || "").trim();
    if (!text) return res.status(400).json({ message: "Vui lòng nhập nội dung đánh giá" });

    const updated = await Review.findOneAndUpdate(
      { userId, productId },
      { userId, productId, content: text, rating: r, isHidden: false },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("userId", "username avatar");

    res.json({ message: "Đánh giá thành công", review: updated });
  } catch (err) {
    console.error("Error upsertMyReview:", err);
    res.status(500).json({ message: "Lỗi server khi gửi đánh giá" });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const reviews = await Review.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(reviews);
  } catch (err) {
    console.error("Error getMyReviews:", err);
    res.status(500).json({ message: "Lỗi server khi lấy đánh giá của bạn" });
  }
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfThisMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalBills, totalReviews] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Bill.countDocuments({}),
      Review.countDocuments({}),
    ]);

    const lowStock = await Product.countDocuments({
      stock: { $lte: 5 },
      status: { $ne: "inactive" },
    });

    const today = startOfToday();
    const month = startOfThisMonth();

    const [billsToday, billsMonth, recentBills] = await Promise.all([
      Bill.find({ createdAt: { $gte: today } })
        .select("tong_tien createdAt trang_thai userId")
        .populate("userId", "username")
        .lean(),
      Bill.find({ createdAt: { $gte: month } }).select("tong_tien").lean(),
      Bill.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("tong_tien createdAt trang_thai userId")
        .populate("userId", "username")
        .lean(),
    ]);

    const revenueToday = billsToday.reduce((sum, b) => sum + Number(b.tong_tien || 0), 0);
    const revenueMonth = billsMonth.reduce((sum, b) => sum + Number(b.tong_tien || 0), 0);

    res.json({
      totals: {
        users: totalUsers,
        products: totalProducts,
        bills: totalBills,
        reviews: totalReviews,
      },
      revenue: {
        today: revenueToday,
        month: revenueMonth,
      },
      lowStock,
      recentBills: (recentBills || []).map((b) => ({
        _id: String(b._id),
        createdAt: b.createdAt,
        tong_tien: Number(b.tong_tien || 0),
        trang_thai: b.trang_thai,
        user: b.userId && typeof b.userId === "object" ? b.userId.username : "",
      })),
    });
  } catch (err) {
    console.error("Error getAdminStats:", err);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
  }
};

const listReviewsAdmin = async (req, res) => {
  try {
    const { q = "", visibility = "all", page = 1, limit = 20 } = req.query || {};
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const keyword = String(q || "").trim();

    const filter = {};
    if (visibility === "hidden") filter.isHidden = true;
    if (visibility === "visible") filter.isHidden = { $ne: true };

    if (keyword) {
      filter.$or = [{ content: { $regex: keyword, $options: "i" } }];
    }

    const [items, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "username email")
        .populate("productId", "name image")
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      items,
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    });
  } catch (err) {
    console.error("Error listReviewsAdmin:", err);
    res.status(500).json({ message: "Lỗi server khi lấy bình luận" });
  }
};

const setReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body || {};
    const hidden = Boolean(isHidden);

    const review = await Review.findByIdAndUpdate(id, { isHidden: hidden }, { new: true })
      .populate("userId", "username email")
      .populate("productId", "name image");

    if (!review) return res.status(404).json({ message: "Không tìm thấy bình luận" });
    res.json({ message: hidden ? "Đã ẩn bình luận" : "Đã hiện bình luận", review });
  } catch (err) {
    console.error("Error setReviewVisibility:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật bình luận" });
  }
};

const deleteReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy bình luận" });
    res.json({ message: "Đã xóa bình luận" });
  } catch (err) {
    console.error("Error deleteReviewAdmin:", err);
    res.status(500).json({ message: "Lỗi server khi xóa bình luận" });
  }
};

module.exports = {
  getReviewsByProduct,
  upsertMyReview,
  getMyReviews,
  getAdminStats,
  listReviewsAdmin,
  setReviewVisibility,
  deleteReviewAdmin,
};
