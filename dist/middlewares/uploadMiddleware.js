"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// middlewares/uploadMiddleware.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// التحقق من نوع الملف
const fileFilter = (req, file, cb) => {
    const allowedExts = [".jpeg", ".jpg", ".png", ".webp"];
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowedExts.includes(ext) && allowedMimeTypes.includes(mime)) {
        cb(null, true);
    }
    else {
        cb(new Error("يُسمح فقط برفع صور بصيغة jpeg, jpg, png, webp"));
    }
};
// إعداد التخزين المحلي
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});
// تهيئة multer
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 ميجا
});
