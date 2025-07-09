import multer from "multer";
import path from "path";
import fs from "fs";

// إنشاء مجلد لو مش موجود
const uploadPath = path.join(__dirname, "../../uploads/offers");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// إعداد التخزين
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `offer-${uniqueSuffix}${ext}`);
  },
});

// فلترة الملفات (صورة أو فيديو)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("نوع الملف غير مدعوم"), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
