const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const formatCartResponse = (cartDoc, productMap) => {
  const items = cartDoc.items
    .map((item) => {
      const product = productMap.get(String(item.productId));
      if (!product) return null;

      const price = Number(product.price || 0);
      const quantity = Number(item.quantity || 1);
      return {
        productId: String(product._id),
        name: product.name,
        image: product.image,
        category: product.category,
        price,
        quantity,
        total: price * quantity,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return { items, subtotal, total: subtotal };
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await getOrCreateCart(userId);
    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, status: { $ne: "inactive" } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));
    res.json(formatCartResponse(cart, productMap));
  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body || {};
    const qty = Math.max(1, Number(quantity) || 1);

    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    const product = await Product.findById(productId);
    if (!product || product.status === "inactive") {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const cart = await getOrCreateCart(userId);
    const itemIndex = cart.items.findIndex((item) => String(item.productId) === String(productId));

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();
    return getCart(req, res);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Lỗi server khi thêm vào giỏ hàng" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body || {};
    const qty = Number(quantity);

    if (!productId || Number.isNaN(qty)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const cart = await getOrCreateCart(userId);
    const itemIndex = cart.items.findIndex((item) => String(item.productId) === String(productId));
    if (itemIndex < 0) {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
    }

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Math.floor(qty);
    }

    await cart.save();
    return getCart(req, res);
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật giỏ hàng" });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await getOrCreateCart(userId);
    cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));
    await cart.save();

    return getCart(req, res);
  } catch (err) {
    console.error("Error removing cart item:", err);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm khỏi giỏ" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
