// middlewares/uploadMiddleware.ts
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// التحقق من نوع الملف
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedExts = [".jpeg", ".jpg", ".png", ".webp"];
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExts.includes(ext) && allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("يُسمح فقط برفع صور بصيغة jpeg, jpg, png, webp"));
  }
};

// إعداد التخزين المحلي
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// تهيئة multer
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 ميجا
});
