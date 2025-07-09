import { Request, Response } from "express";
import Company from "../models/Company";

// ✅ إيقاف الشركة مؤقتًا
export const pauseCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });

    company.isActive = false;
    company.status = "pending";
    await company.save();

    res.json({ message: "تم تعليق الشركة مؤقتًا" });
  } catch (err) {
    console.error("❌ Pause Error:", err);
    res.status(500).json({ message: "فشل تعليق الشركة" });
  }
};

// ✅ تمديد الاشتراك (مؤقت بدون حساب الأيام)
export const extendCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });

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
  } catch (err) {
    console.error("❌ Extend Error:", err);
    res.status(500).json({ message: "فشل تمديد الاشتراك" });
  }
};

// ✅ إلغاء تعليق الشركة
export const unpauseCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "الشركة غير موجودة" });
    }

    company.isActive = true;
    company.status = "active";
    await company.save();

    res.json({ message: "✅ تم تفعيل الشركة مرة أخرى" });
  } catch (error) {
    console.error("❌ Unpause Error:", error);
    res.status(500).json({ message: "فشل في إعادة تفعيل الشركة" });
  }
};
