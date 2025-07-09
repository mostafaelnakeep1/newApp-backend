import express from "express";
import {
  createOffer,
  getAllOffers,
  getCompanyProfile,
} from "../controllers/companyController";
import { createProduct } from "../controllers/productController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import upload from "../middlewares/multerConfig";
import { checkCompanyActive } from "../middlewares/checkCompanyActive"; // تأكد من مسار الملف بدون مسافات
import { getActiveCompaniesOrdered } from "../controllers/companyController";

const router = express.Router();


router.get("/active-ordered", getActiveCompaniesOrdered);
// ✅ مسار المنتجات (بـ POST /api/company/products)
router.post(
  "/products",
  protect,
  authorize(["company"]),
  checkCompanyActive,
  createProduct
);

// ✅ بيانات الشركة (GET /api/company/profile)
router.get(
  "/profile",
  protect,
  authorize(["company"]),
  checkCompanyActive,
  getCompanyProfile
);


// ✅ إنشاء عرض (فعلي)
router.post(
  "/offers",
  protect,
  authorize(["company"]),
  checkCompanyActive,
  upload.single("media"),
  createOffer // ✅ أخيرًا نوصل للفنكشن الفعلية
);

// ✅ جلب كل العروض بدون حماية (GET /api/company/offers)
router.get("/offers", getAllOffers);

export default router;
