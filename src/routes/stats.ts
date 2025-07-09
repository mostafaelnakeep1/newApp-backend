// routes/statsRoutes.ts
import express from "express";
import {
  getAdminStats,
  getCompanySalesStats,
  getClientCount,
  getCompanyCount,
  getTotalSales,
  getMonthlySales,
  getTopCompaniesStats,
  getTopBrandsStats,
  getSuspendedCompanies,
  getCompaniesWithRemainingDays,
  getCompanyRankThisMonth,
} from "../controllers/statsController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = express.Router();

// 🟡 إحصائيات عامة للوحة التحكم (Admin)
router.get("/admin", protect, authorize(["admin"]), getAdminStats);

// 🔵 إحصائيات شركة محددة (Admin)
router.get("/company/:companyId", protect, authorize(["admin"]), getCompanySalesStats);

// 🟠 عدد العملاء
router.get("/clients", protect, authorize(["admin"]), getClientCount);

// 🟠 عدد الشركات
router.get("/companies", protect, authorize(["admin"]), getCompanyCount);

// 🟢 عدد الأجهزة المباعة كليًا
router.get("/sales/total", protect, authorize(["admin"]), getTotalSales);

// 🟢 مبيعات الأشهر السابقة
router.get("/sales/monthly", protect, authorize(["admin"]), getMonthlySales);

// 🔴 الشركات المعلقة
router.get("/companies/suspended", protect, authorize(["admin"]), getSuspendedCompanies);

// ⏱️ الشركات وعدد الأيام المتبقية قبل التعليق
router.get("/companies/remaining-days", protect, authorize(["admin"]), getCompaniesWithRemainingDays);

// 🥇 أعلى الشركات مبيعًا
router.get("/top-companies", protect, authorize(["admin"]), getTopCompaniesStats);

// 🥇 أعلى البراندات مبيعًا
router.get("/top-brands", protect, authorize(["admin"]), getTopBrandsStats);

//ترتيب الشركة بين الشركات
router.get("/company-rank/:companyId", getCompanyRankThisMonth);

export default router;
