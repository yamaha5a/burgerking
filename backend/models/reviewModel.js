const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // sẽ có createdAt = ngày đánh giá
    collection: "reviews",
  }
);

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);