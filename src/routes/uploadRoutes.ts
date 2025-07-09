// routes/uploadRoutes.ts
import express from "express";
import { upload } from "../middlewares/uploadMiddleware";
import { isAdmin, authorize } from "../middlewares/roleMiddleware";

const router = express.Router();

// ✅ رفع صورة منتج افتراضية (admin only)
router.post("/product", isAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "لم يتم رفع صورة" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ message: "تم رفع الصورة", imageUrl });
});

// ✅ رفع صورة منتج بواسطة الشركة
router.post("/product/by-company", authorize(["company"]), upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "لم يتم رفع صورة" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ message: "تم رفع الصورة", imageUrl });
});

// ✅ رفع صورة بروفايل لمستخدم (client / company)
router.post(
  "/user-profile",
  authorize(["client", "company"]),
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "لم يتم رفع صورة" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(201).json({ message: "تم رفع صورة البروفايل", imageUrl });
  }
);

// ✅ رفع عدة صور لأعمال الشركة (company only)
router.post(
  "/company-portfolio",
  authorize(["company"]),
  upload.array("images", 10),
  (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0)
      return res.status(400).json({ message: "لم يتم رفع أي صور" });

    const imageUrls = files.map((file) =>
      `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    res.status(201).json({ message: "تم رفع صور الأعمال", imageUrls });
  }
);

export default router;
