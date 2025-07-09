"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpauseCompany = exports.extendCompany = exports.pauseCompany = void 0;
const Company_1 = __importDefault(require("../models/Company"));
// ✅ إيقاف الشركة مؤقتًا
const pauseCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company_1.default.findById(companyId);
        if (!company)
            return res.status(404).json({ message: "الشركة غير موجودة" });
        company.isActive = false;
        company.status = "pending";
        await company.save();
        res.json({ message: "تم تعليق الشركة مؤقتًا" });
    }
    catch (err) {
        console.error("❌ Pause Error:", err);
        res.status(500).json({ message: "فشل تعليق الشركة" });
    }
};
exports.pauseCompany = pauseCompany;
// ✅ تمديد الاشتراك (مؤقت بدون حساب الأيام)
const extendCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company_1.default.findById(companyId);
        if (!company)
            return res.status(404).json({ message: "الشركة غير موجودة" });
        const now = new Date();
        const extendedDate = new Date();
        extendedDate.setDate(now.getDate() + 30); // تمديد 30 يوم
        company.subscriptionEnd = extendedDate;
        company.isActive = true;
        company.status = "active";
        await company.save();
        res.json({
            message: `تم تمديد الاشتراك حتى ${extendedDate.toISOString()}`,
        });
    }
    catch (err) {
        console.error("❌ Extend Error:", err);
        res.status(500).json({ message: "فشل تمديد الاشتراك" });
    }
};
exports.extendCompany = extendCompany;
// ✅ إلغاء تعليق الشركة
const unpauseCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }
        company.isActive = true;
        company.status = "active";
        await company.save();
        res.json({ message: "✅ تم تفعيل الشركة مرة أخرى" });
    }
    catch (error) {
        console.error("❌ Unpause Error:", error);
        res.status(500).json({ message: "فشل في إعادة تفعيل الشركة" });
    }
};
exports.unpauseCompany = unpauseCompany;
