const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");

const router = express.Router();

// Public: sản phẩm mới nhất (client)
router.get("/public", productController.getPublicProducts);
router.get("/public/latest", productController.getLatestPublicProducts);
router.get("/public/:id", productController.getPublicProductById);

// Chỉ admin mới được quản lý sản phẩm
router.get("/", requireAuth, requireAdmin, productController.getProducts);
router.get("/:id", requireAuth, requireAdmin, productController.getProductById);
router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  productController.createProduct
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  productController.updateProduct
);
router.delete("/:id", requireAuth, requireAdmin, productController.deleteProduct);

module.exports = router;

