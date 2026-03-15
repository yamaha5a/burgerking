const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "admin"] },
    avatar: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    voucher: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
