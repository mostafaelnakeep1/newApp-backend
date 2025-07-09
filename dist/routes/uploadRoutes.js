"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/uploadRoutes.ts
const express_1 = __importDefault(require("express"));
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
// ✅ رفع صورة منتج افتراضية (admin only)
router.post("/product", roleMiddleware_1.isAdmin, uploadMiddleware_1.upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع صورة" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(201).json({ message: "تم رفع الصورة", imageUrl });
});
// ✅ رفع صورة منتج بواسطة الشركة
router.post("/product/by-company", (0, roleMiddleware_1.authorize)(["company"]), uploadMiddleware_1.upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع صورة" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(201).json({ message: "تم رفع الصورة", imageUrl });
});
// ✅ رفع صورة بروفايل لمستخدم (client / company)
router.post("/user-profile", (0, roleMiddleware_1.authorize)(["client", "company"]), uploadMiddleware_1.upload.single("image"), (req, res) => {
    if (!req.file)
        return res.status(400).json({ message: "لم يتم رفع صورة" });
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(201).json({ message: "تم رفع صورة البروفايل", imageUrl });
});
// ✅ رفع عدة صور لأعمال الشركة (company only)
router.post("/company-portfolio", (0, roleMiddleware_1.authorize)(["company"]), uploadMiddleware_1.upload.array("images", 10), (req, res) => {
    const files = req.files;
    if (!files || files.length === 0)
        return res.status(400).json({ message: "لم يتم رفع أي صور" });
    const imageUrls = files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);
    res.status(201).json({ message: "تم رفع صور الأعمال", imageUrls });
});
exports.default = router;
