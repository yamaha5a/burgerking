const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

const router = express.Router();

// Chỉ admin mới được xem danh sách user
router.get("/", requireAuth, requireAdmin, userController.getUsers);
router.get("/me", requireAuth, userController.getMyProfile);
router.put("/me", requireAuth, upload.single("avatar"), userController.updateMyProfile);
router.put("/me/change-password", requireAuth, userController.changeMyPassword);

module.exports = router;

