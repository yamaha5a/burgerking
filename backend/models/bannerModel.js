const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },

    createdAt: { 
      type: Date, 
      default: Date.now 
    },

    image: { 
      type: String, 
      required: true 
    },

    text: { 
      type: String, 
      required: false,
      default: ""
    },

    font: { 
      type: String, 
      default: "Poppins" 
    }
  },
  { collection: "banners" }
);

module.exports = mongoose.model("Banner", bannerSchema);