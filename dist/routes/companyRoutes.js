"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const multerConfig_1 = __importDefault(require("../middlewares/multerConfig"));
const checkCompanyActive_1 = require("../middlewares/checkCompanyActive"); // تأكد من مسار الملف بدون مسافات
const companyController_2 = require("../controllers/companyController");
const router = express_1.default.Router();
router.get("/active-ordered", companyController_2.getActiveCompaniesOrdered);
// ✅ مسار المنتجات (بـ POST /api/company/products)
router.post("/products", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["company"]), checkCompanyActive_1.checkCompanyActive, productController_1.createProduct);
// ✅ بيانات الشركة (GET /api/company/profile)
router.get("/profile", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["company"]), checkCompanyActive_1.checkCompanyActive, companyController_1.getCompanyProfile);
// ✅ إنشاء عرض (فعلي)
router.post("/offers", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["company"]), checkCompanyActive_1.checkCompanyActive, multerConfig_1.default.single("media"), companyController_1.createOffer // ✅ أخيرًا نوصل للفنكشن الفعلية
);
// ✅ جلب كل العروض بدون حماية (GET /api/company/offers)
router.get("/offers", companyController_1.getAllOffers);
exports.default = router;
