import express from "express";
import Company from "../models/Company";
//import { differenceInDays } from "date-fns";
import { ICompany } from "../models/Company";

const router = express.Router();

// استرجاع كل الشركات العامة
router.get("/", async (req, res) => {
  try {
    const companies: ICompany[] = await Company.find({
      isApproved: true,
      isSuspended: false,
    });

    res.json(companies);
  } catch (error) {
    console.error("❌ Error in /companies:", error);
    res.status(500).json({ message: "حدث خطأ أثناء تحميل الشركات" });
  }
});

// ✅ أفضل 10 شركات (ترتيب عشوائي مؤقت)
router.get("/top", async (req, res) => {
  try {
    const companies: ICompany[] = await Company.find({
      status: "active",
      isSuspended: false,
    }).sort({ approvedAt: -1 }); // الأحدث تفعيلًا

    const topCompanies = companies
      .slice(0, 10)
      .map((c) => ({
        _id: c._id,
        name: c.name,
        logo: c.logo || null,
        rating: 4.5, // مؤقت
        location: c.city || "غير محدد",
        devicesSold: c.productsCount || Math.floor(Math.random() * 50 + 50),
      }));

    res.json(topCompanies);
  } catch (error) {
    console.error("❌ Error in /top companies:", error);
    res.status(500).json({ message: "خطأ في تحميل أفضل الشركات" });
  }
});

export default router;
