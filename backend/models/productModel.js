const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    image: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    origin: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["in_stock", "out_of_stock", "inactive"],
      default: "in_stock",
    },
  },
  { collection: "products", timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);