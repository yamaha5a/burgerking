const express = require("express");
const Banner = require("../models/bannerModel");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/banners - danh sách banner
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error("Error fetching banners:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách banner" });
  }
});

// Helper: lấy id tăng dần
async function getNextId() {
  const last = await Banner.findOne().sort({ id: -1 }).lean();
  return last ? last.id + 1 : 1;
}

// POST /api/banners - tạo banner mới
router.post("/", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { text, font } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng tải lên hình ảnh banner" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "subnautica/banners",
    });

    const banner = await Banner.create({
      id: await getNextId(),
      image: uploadResult.secure_url,
      text: text || "",
      font: font || "Poppins",
    });

    res.status(201).json(banner);
  } catch (err) {
    console.error("Error creating banner:", err);
    res.status(500).json({ message: "Lỗi server khi tạo banner" });
  }
});

// PUT /api/banners/:id - cập nhật banner
router.put("/:id", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { text, font } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    if (text) banner.text = text;
    if (font) banner.font = font;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "subnautica/banners",
      });
      banner.image = uploadResult.secure_url;
    }

    await banner.save();
    res.json(banner);
  } catch (err) {
    console.error("Error updating banner:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật banner" });
  }
});

// DELETE /api/banners/:id - xóa banner
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }
    res.json({ message: "Đã xóa banner" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ message: "Lỗi server khi xóa banner" });
  }
});

module.exports = router;

