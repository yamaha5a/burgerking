const Bill = require("../models/billModel");
const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinary");

const getMyBills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trang_thai } = req.query;

    const filter = { userId };
    if (trang_thai) {
      filter.trang_thai = String(trang_thai);
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    console.error("Error fetching my bills:", err);
    res.status(500).json({ message: "Lỗi server khi lấy hóa đơn" });
  }
};

const getBillsAdmin = async (req, res) => {
  try {
    const { trang_thai } = req.query;
    const filter = {};
    if (trang_thai) filter.trang_thai = String(trang_thai);

    const bills = await Bill.find(filter)
      .populate("userId", "username email phone")
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    console.error("Error fetching bills admin:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách hóa đơn" });
  }
};

const updateBillStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body || {};
    const allowed = ["chờ thanh toán", "chờ vận chuyển", "chờ nhận", "cần đánh giá", "trả hàng"];
    if (!allowed.includes(String(trang_thai))) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    const current = String(bill.trang_thai);
    const nextByCurrent = {
      "chờ thanh toán": "chờ vận chuyển",
      "chờ vận chuyển": "chờ nhận",
      "chờ nhận": "cần đánh giá",
      "cần đánh giá": null,
      "trả hàng": null,
    };

    const requiredNext = nextByCurrent[current];
    if (!requiredNext) {
      return res
        .status(400)
        .json({ message: "Đơn ở trạng thái hiện tại không thể cập nhật thêm" });
    }

    if (String(trang_thai) !== requiredNext) {
      return res.status(400).json({
        message: `Chỉ được chuyển từ "${current}" sang "${requiredNext}"`,
      });
    }

    if (requiredNext === "cần đánh giá") {
      for (const item of bill.danh_sach_san_pham || []) {
        if (!item.productId) continue;
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Sản phẩm trong đơn không còn tồn tại` });
        }
        const quantity = Number(item.quantity || 0);
        if (product.stock < quantity) {
          return res.status(400).json({
            message: `Không đủ tồn kho để hoàn tất đơn cho sản phẩm "${product.name}"`,
          });
        }
      }

      for (const item of bill.danh_sach_san_pham || []) {
        if (!item.productId) continue;
        const quantity = Number(item.quantity || 0);
        const updatedProduct = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -quantity } },
          { new: true }
        );
        if (!updatedProduct) continue;

        const nextStatus = updatedProduct.stock <= 0 ? "out_of_stock" : "in_stock";
        if (updatedProduct.status !== nextStatus) {
          updatedProduct.status = nextStatus;
          await updatedProduct.save();
        }
      }
    }

    bill.trang_thai = requiredNext;
    await bill.save();

    res.json({ message: "Cập nhật trạng thái thành công", bill });
  } catch (err) {
    console.error("Error updating bill status admin:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái hóa đơn" });
  }
};

const cancelMyBill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy đơn" });
    }

    const bill = await Bill.findOne({ _id: id, userId });
    if (!bill) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    if (bill.trang_thai !== "chờ thanh toán") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy đơn ở trạng thái chờ thanh toán" });
    }

    const diffMs = Date.now() - new Date(bill.createdAt).getTime();
    const twentyMinutesMs = 20 * 60 * 1000;
    if (diffMs > twentyMinutesMs) {
      return res.status(400).json({ message: "Đã quá 20 phút, không thể hủy đơn" });
    }

    bill.trang_thai = "trả hàng";
    bill.ly_do_huy_user = String(reason).trim();
    bill.ly_do_huy_admin = "";
    await bill.save();

    res.json({ message: "Hủy đơn thành công", bill });
  } catch (err) {
    console.error("Error cancelling bill:", err);
    res.status(500).json({ message: "Lỗi server khi hủy đơn hàng" });
  }
};

const requestReturnItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { productId, reason } = req.body || {};

    if (!productId || !String(productId).trim()) {
      return res.status(400).json({ message: "Thiếu mã sản phẩm" });
    }
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hoàn hàng" });
    }

    const bill = await Bill.findOne({ _id: id, userId });
    if (!bill) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    if (bill.trang_thai !== "cần đánh giá") {
      return res.status(400).json({
        message: "Chỉ có thể yêu cầu hoàn hàng khi đơn ở trạng thái cần đánh giá",
      });
    }

    const pid = String(productId).trim();
    const idx = (bill.danh_sach_san_pham || []).findIndex(
      (item) => String(item.productId) === pid
    );
    if (idx === -1) {
      return res.status(400).json({ message: "Sản phẩm không thuộc đơn hàng này" });
    }

    const line = bill.danh_sach_san_pham[idx];
    if (line.hoan_hang && line.hoan_hang.ngay_gui) {
      return res.status(400).json({ message: "Bạn đã gửi yêu cầu hoàn hàng cho sản phẩm này" });
    }

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "subnautica/bill-returns",
      });
      imageUrl = uploadResult.secure_url;
    }

    bill.danh_sach_san_pham[idx].hoan_hang = {
      ly_do: String(reason).trim(),
      image: imageUrl,
      ngay_gui: new Date(),
    };
    await bill.save();

    res.json({ message: "Đã gửi yêu cầu hoàn hàng", bill });
  } catch (err) {
    console.error("Error request return item:", err);
    res.status(500).json({ message: "Lỗi server khi gửi hoàn hàng" });
  }
};

const cancelBillAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy" });
    }

    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    if (bill.trang_thai !== "chờ thanh toán") {
      return res.status(400).json({ message: "Admin chỉ hủy được đơn ở trạng thái chờ thanh toán" });
    }

    bill.trang_thai = "trả hàng";
    bill.ly_do_huy_admin = String(reason).trim();
    await bill.save();

    res.json({ message: "Admin đã hủy đơn thành công", bill });
  } catch (err) {
    console.error("Error admin cancelling bill:", err);
    res.status(500).json({ message: "Lỗi server khi admin hủy đơn hàng" });
  }
};

module.exports = {
  getMyBills,
  getBillsAdmin,
  updateBillStatusAdmin,
  cancelMyBill,
  cancelBillAdmin,
  requestReturnItem,
};
