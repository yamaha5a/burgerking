const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewControoler");

const router = express.Router();

router.get("/stats", requireAuth, requireAdmin, reviewController.getAdminStats);

router.get("/reviews", requireAuth, requireAdmin, reviewController.listReviewsAdmin);
router.patch(
  "/reviews/:id/visibility",
  requireAuth,
  requireAdmin,
  reviewController.setReviewVisibility
);
router.delete("/reviews/:id", requireAuth, requireAdmin, reviewController.deleteReviewAdmin);

module.exports = router;

