const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/", requireAuth, cartController.getCart);
router.post("/add", requireAuth, cartController.addToCart);
router.put("/item", requireAuth, cartController.updateCartItem);
router.delete("/item/:productId", requireAuth, cartController.removeCartItem);

module.exports = router;
