const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

// Public: danh mục hiển thị ở client
router.get("/public", categoryController.getPublicCategories);

// Chỉ admin mới được quản lý danh mục
router.get("/", requireAuth, requireAdmin, categoryController.getCategories);
router.get("/:id", requireAuth, requireAdmin, categoryController.getCategoryById);
router.post("/", requireAuth, requireAdmin, categoryController.createCategory);
router.put("/:id", requireAuth, requireAdmin, categoryController.updateCategory);
router.delete("/:id", requireAuth, requireAdmin, categoryController.deleteCategory);

module.exports = router;

