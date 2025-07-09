"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/adRoutes.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const adController_1 = require("../controllers/adController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/ads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter(req, file, cb) {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext !== ".mp4" && ext !== ".mov" && ext !== ".avi") {
            return cb(new Error("Only video files are allowed"));
        }
        cb(null, true);
    },
});
// إضافة إعلان جديد
router.post("/", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), upload.single("video"), adController_1.addAd);
// جلب الإعلانات النشطة (للاستخدام العام)
router.get("/", adController_1.getActiveAds);
// جلب كل الإعلانات (للوحة تحكم الأدمن)
router.get("/admin", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), adController_1.getAllAds);
// تعديل إعلان معين (تعليق، تمديد مدة، تعديل موضع..)
router.patch("/:id", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), adController_1.updateAd);
// حذف إعلان معين
router.delete("/:id", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), adController_1.deleteAd);
exports.default = router;
