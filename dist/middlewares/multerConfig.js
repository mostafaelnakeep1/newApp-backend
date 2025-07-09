"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// إنشاء مجلد لو مش موجود
const uploadPath = path_1.default.join(__dirname, "../../uploads/offers");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
// إعداد التخزين
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `offer-${uniqueSuffix}${ext}`);
    },
});
// فلترة الملفات (صورة أو فيديو)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    if (allowedTypes.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error("نوع الملف غير مدعوم"), false);
};
const upload = (0, multer_1.default)({ storage, fileFilter });
exports.default = upload;
