const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    danh_sach_san_pham: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        image: String,
        category: String,
        price: Number,
        quantity: Number,
        total: Number,
        hoan_hang: {
          ly_do: { type: String, default: "" },
          image: { type: String, default: "" },
          ngay_gui: { type: Date },
        },
      },
    ],

    tong_tien: {
      type: Number,
      required: true,
      default: 0,
    },

    dia_chi_giao_hang: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    phuong_thuc_thanh_toan: {
      type: String,
      enum: ["COD", "BANKING"],
      default: "COD",
    },

    ghi_chu: {
      type: String,
      default: "",
    },
    ly_do_huy_user: {
      type: String,
      default: "",
    },
    ly_do_huy_admin: {
      type: String,
      default: "",
    },

    trang_thai: {
      type: String,
      enum: [
        "chờ thanh toán",
        "chờ vận chuyển",
        "chờ nhận",
        "cần đánh giá",
        "trả hàng",
      ],
      default: "chờ thanh toán",
    },
  },
  {
    collection: "bills",
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", billSchema);