const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewControoler");

const router = express.Router();

// Public: lấy đánh giá theo sản phẩm
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Client: tạo/cập nhật đánh giá (1 user / 1 product)
router.post("/", requireAuth, reviewController.upsertMyReview);

// Client: xem đánh giá của tôi (tuỳ dùng)
router.get("/my", requireAuth, reviewController.getMyReviews);

module.exports = router;
