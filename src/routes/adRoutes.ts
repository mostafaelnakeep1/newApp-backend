// routes/adRoutes.ts
import express from "express";
import multer from "multer";
import path from "path";
import { addAd, getActiveAds, updateAd, getAllAds, deleteAd } from "../controllers/adController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/ads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".mp4" && ext !== ".mov" && ext !== ".avi") {
      return cb(new Error("Only video files are allowed"));
    }
    cb(null, true);
  },
});

// إضافة إعلان جديد
router.post(
  "/",
  protect,
  authorize(["admin"]),
  upload.single("video"),
  addAd
);

// جلب الإعلانات النشطة (للاستخدام العام)
router.get("/", getActiveAds);

// جلب كل الإعلانات (للوحة تحكم الأدمن)
router.get("/admin", protect, authorize(["admin"]), getAllAds);

// تعديل إعلان معين (تعليق، تمديد مدة، تعديل موضع..)
router.patch("/:id", protect, authorize(["admin"]), updateAd);

// حذف إعلان معين
router.delete("/:id", protect, authorize(["admin"]), deleteAd);

export default router;
