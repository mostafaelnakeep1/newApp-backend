"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/statsRoutes.ts
const express_1 = __importDefault(require("express"));
const statsController_1 = require("../controllers/statsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
// 🟡 إحصائيات عامة للوحة التحكم (Admin)
router.get("/admin", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getAdminStats);
// 🔵 إحصائيات شركة محددة (Admin)
router.get("/company/:companyId", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getCompanySalesStats);
// 🟠 عدد العملاء
router.get("/clients", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getClientCount);
// 🟠 عدد الشركات
router.get("/companies", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getCompanyCount);
// 🟢 عدد الأجهزة المباعة كليًا
router.get("/sales/total", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getTotalSales);
// 🟢 مبيعات الأشهر السابقة
router.get("/sales/monthly", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getMonthlySales);
// 🔴 الشركات المعلقة
router.get("/companies/suspended", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getSuspendedCompanies);
// ⏱️ الشركات وعدد الأيام المتبقية قبل التعليق
router.get("/companies/remaining-days", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getCompaniesWithRemainingDays);
// 🥇 أعلى الشركات مبيعًا
router.get("/top-companies", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getTopCompaniesStats);
// 🥇 أعلى البراندات مبيعًا
router.get("/top-brands", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), statsController_1.getTopBrandsStats);
//ترتيب الشركة بين الشركات
router.get("/company-rank/:companyId", statsController_1.getCompanyRankThisMonth);
exports.default = router;
