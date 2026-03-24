const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const billController = require("../controllers/billController");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/my", requireAuth, billController.getMyBills);
router.patch("/my/:id/cancel", requireAuth, billController.cancelMyBill);
router.patch(
  "/my/:id/return-item",
  requireAuth,
  upload.single("image"),
  billController.requestReturnItem
);
router.get("/", requireAuth, requireAdmin, billController.getBillsAdmin);
router.patch("/:id/status", requireAuth, requireAdmin, billController.updateBillStatusAdmin);
router.patch("/:id/admin-cancel", requireAuth, requireAdmin, billController.cancelBillAdmin);

module.exports = router;
