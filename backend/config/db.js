const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mihato");

    console.log("MongoDB connected");
  } catch (error) {
    console.log("Database error:", error);
  }
};

module.exports = connectDB;
