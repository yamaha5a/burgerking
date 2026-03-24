const Product = require("../models/productModel");
const Bill = require("../models/billModel");
const cloudinary = require("../config/cloudinary");

// GET /api/products/public/:id
const getPublicProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: { $ne: "inactive" },
    });
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching public product detail:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết sản phẩm" });
  }
};

// GET /api/products/public
// Query: page, limit, search, category, sort (newest|oldest|price_asc|price_desc)
const getPublicProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;
    const { search = "", category = "", sort = "newest" } = req.query;

    const filter = { status: { $ne: "inactive" } };
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { category: regex }, { origin: regex }];
    }
    if (category) {
      filter.category = String(category);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "price_asc") sortOption = { price: 1, createdAt: -1 };
    if (sort === "price_desc") sortOption = { price: -1, createdAt: -1 };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
    ]);

    res.json({
      data: products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching public products:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
  }
};

// GET /api/products/public/latest
// Query: limit (default 8)
const getLatestPublicProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await Product.find({ status: { $ne: "inactive" } })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50));
    res.json(products);
  } catch (err) {
    console.error("Error fetching latest public products:", err);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm mới nhất" });
  }
};

// GET /api/products
// Query: page, limit, search, sort (newest|oldest)
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search = "", sort = "newest" } = req.query;

    const filter = {};
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { category: regex }, { origin: regex }];
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
    ]);

    res.json({
      data: products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết sản phẩm" });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      stock,
      description = "",
      origin = "",
      status,
    } = req.body || {};

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({
        message: "Thiếu trường bắt buộc (name, category, price)",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng tải lên hình ảnh sản phẩm" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "subnautica/products",
    });

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      stock: stock === undefined || stock === null || stock === "" ? 0 : Number(stock),
      image: uploadResult.secure_url,
      description,
      origin,
      status,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Lỗi server khi tạo sản phẩm" });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const {
      name,
      category,
      price,
      stock,
      description,
      origin,
      status,
    } = req.body || {};

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (description !== undefined) product.description = description;
    if (origin !== undefined) product.origin = origin;
    if (status !== undefined) product.status = status;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "subnautica/products",
      });
      product.image = uploadResult.secure_url;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm" });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const ordered = await Bill.exists({
      "danh_sach_san_pham.productId": req.params.id,
    });
    if (ordered) {
      return res
        .status(400)
        .json({ message: "Không thể xóa sản phẩm đã phát sinh trong đơn hàng" });
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
};

module.exports = {
  getPublicProductById,
  getPublicProducts,
  getLatestPublicProducts,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

