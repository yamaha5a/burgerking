const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Bill = require("../models/billModel");

// GET /api/categories/public
// Trả danh mục active + số lượng sản phẩm đang hiển thị
const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" }).sort({ name: 1 }).lean();
    const names = categories.map((c) => c.name);

    let countMap = {};
    if (names.length > 0) {
      const counts = await Product.aggregate([
        {
          $match: {
            status: { $ne: "inactive" },
            category: { $in: names },
          },
        },
        { $group: { _id: "$category", total: { $sum: 1 } } },
      ]);
      countMap = counts.reduce((acc, item) => {
        acc[item._id] = item.total;
        return acc;
      }, {});
    }

    const data = categories.map((c) => ({
      ...c,
      productCount: countMap[c.name] || 0,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching public categories:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh mục hiển thị" });
  }
};

// GET /api/categories
// Query: page, limit, search, sort (newest|oldest)
const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search = "", sort = "newest" } = req.query;

    const filter = {};
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { description: regex }];
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [total, categories] = await Promise.all([
      Category.countDocuments(filter),
      Category.find(filter).sort(sortOption).skip(skip).limit(limit),
    ]);

    res.json({
      data: categories,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách danh mục" });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết danh mục" });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description = "", status = "active" } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Vui lòng nhập tên danh mục" });
    }

    const category = await Category.create({
      name: String(name).trim(),
      description,
      status,
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: "Lỗi server khi tạo danh mục" });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await Category.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật danh mục" });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

    const hasOrderedByCategoryName = await Bill.exists({
      "danh_sach_san_pham.category": category.name,
    });
    if (hasOrderedByCategoryName) {
      return res
        .status(400)
        .json({ message: "Không thể xóa danh mục đã phát sinh trong đơn hàng" });
    }

    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json({ message: "Đã xóa danh mục" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Lỗi server khi xóa danh mục" });
  }
};

module.exports = {
  getPublicCategories,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

