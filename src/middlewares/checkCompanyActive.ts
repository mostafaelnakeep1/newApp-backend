import { Request, Response, NextFunction } from "express";
import Company from "../models/Company";


export const checkCompanyActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("✅ checkCompanyActive running");
    console.log("🔐 user in req:", req.user);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    const companyId = req.user._id;

    const company = await Company.findOne({
      $or: [
        { _id: companyId },
        { user: companyId } // لو مرتبط باليوزر
      ]
    });

    if (!company) {
      return res.status(404).json({ message: "الشركة غير موجودة" });
    }

    if (company.status !== "active") {
      return res.status(403).json({ message: "في انتظار موافقة الإدارة على شركتك" });
    }

    next();
  } catch (error) {
    console.error("Error checking company status:", error);
    res.status(500).json({ message: "خطأ في التحقق من حالة الشركة" });
  }
};
