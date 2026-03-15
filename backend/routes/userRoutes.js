const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// Chỉ admin mới được xem danh sách user
router.get("/", requireAuth, requireAdmin, userController.getUsers);

module.exports = router;

