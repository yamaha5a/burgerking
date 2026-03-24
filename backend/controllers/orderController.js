const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Bill = require("../models/billModel");

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customerInfo, paymentMethod = "cod" } = req.body || {};

    if (
      !customerInfo ||
      !customerInfo.name ||
      !customerInfo.email ||
      !customerInfo.phone ||
      !customerInfo.xa ||
      !customerInfo.tinh ||
      !customerInfo.diaChiCuThe
    ) {
      return res.status(400).json({ message: "Thiếu thông tin nhận hàng bắt buộc" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng đang trống" });
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, status: { $ne: "inactive" } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const billItems = [];
    for (const cartItem of cart.items) {
      const product = productMap.get(String(cartItem.productId));
      if (!product) continue;
      const price = Number(product.price || 0);
      const quantity = Number(cartItem.quantity || 1);
      billItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        category: product.category,
        price,
        quantity,
        total: price * quantity,
      });
    }

    if (billItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm hợp lệ để đặt hàng" });
    }

    const tongTien = billItems.reduce((sum, item) => sum + item.total, 0);
    const diaChiGiaoHang = [
      String(customerInfo.diaChiCuThe || "").trim(),
      String(customerInfo.xa || "").trim(),
      String(customerInfo.tinh || "").trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const bill = await Bill.create({
      userId,
      danh_sach_san_pham: billItems,
      tong_tien: tongTien,
      dia_chi_giao_hang: diaChiGiaoHang,
      phone: String(customerInfo.phone).trim(),
      phuong_thuc_thanh_toan: paymentMethod === "paypal" ? "BANKING" : "COD",
      ghi_chu: customerInfo.note ? String(customerInfo.note).trim() : "",
      // Sau khi đặt hàng, mọi đơn đều bắt đầu ở trạng thái chờ thanh toán.
      trang_thai: "chờ thanh toán",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Đặt hàng thành công",
      orderId: bill._id,
      total: bill.tong_tien,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
  }
};

module.exports = {
  createOrder,
};
