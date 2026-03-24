const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post("/", requireAuth, orderController.createOrder);

module.exports = router;
