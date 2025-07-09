"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db"); // استدعاء دالة الاتصال بقاعدة البيانات
const path_1 = __importDefault(require("path"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const auth_1 = __importDefault(require("./routes/auth"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const adRoutes_1 = __importDefault(require("./routes/adRoutes"));
const stats_1 = __importDefault(require("./routes/stats"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const suspendCompaniesJob_1 = require("./jops/suspendCompaniesJob");
const publicCompanyRoutes_1 = __importDefault(require("./routes/publicCompanyRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const attachUser_1 = require("./middlewares/attachUser");
const authMiddleware_1 = require("./middlewares/authMiddleware");
const offerRoutes_1 = __importDefault(require("./routes/offerRoutes"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const uploadsPath = path_1.default.join(__dirname, "../uploads");
const defaultImagePath = path_1.default.join(uploadsPath, "default.jpg");
app.use("/uploads", (req, res, next) => {
    const requestedFile = path_1.default.join(uploadsPath, req.path);
    fs_1.default.access(requestedFile, fs_1.default.constants.F_OK, (err) => {
        if (err) {
            // الملف مش موجود، رجع الصورة الافتراضية
            res.sendFile(defaultImagePath);
        }
        else {
            // الملف موجود، كمل على express.static
            next();
        }
    });
});
app.use("/uploads", express_1.default.static(uploadsPath));
app.use("/api/offers", offerRoutes_1.default);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(">>>> Authorization Header:", req.headers.authorization);
    next();
});
app.use((req, res, next) => {
    console.log(`📥 Request to: ${req.method} ${req.originalUrl}`);
    next();
});
// الراوتات المفتوحة (بدون حماية)
app.use("/api/auth", auth_1.default);
// ملفات الاستاتيك المفتوحة
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/uploads/ads", express_1.default.static(path_1.default.join(__dirname, "../uploads/ads")));
app.use("/api/companies", publicCompanyRoutes_1.default);
// بعدها نفعّل الحماية لكل الراوتات اللي بعدها
app.use(authMiddleware_1.protect);
app.use((req, res, next) => {
    console.log("➡️ Middleware 1: قبل attachUser");
    next();
});
app.use(attachUser_1.attachUser);
app.use((req, res, next) => {
    console.log("➡️ Middleware 2: بعد attachUser");
    next();
});
// الراوتات المحمية (تحتاج توكن)
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/upload", uploadRoutes_1.default);
app.use("/api/company", companyRoutes_1.default);
app.use("/api/stats", stats_1.default);
app.use("/api/profile", profileRoutes_1.default);
app.use("/api/ads", adRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/dashboard", dashboardRoutes_1.default);
app._router.stack
    .filter((r) => r.route)
    .map((r) => console.log(r.route?.path, Object.keys(r.route?.methods)));
// تشغيل المهمة المجدولة
(0, suspendCompaniesJob_1.suspendCompaniesJob)();
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
