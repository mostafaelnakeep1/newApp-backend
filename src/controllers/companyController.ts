import { Request, Response } from "express";
import Company from "../models/Company"; // تأكد إن مسار الموديل صح عندك
import Offer from "../models/Offer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Notification from "../models/Notification";



// جلب كل الشركات
export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({});
    res.status(200).json(companies);
  } catch (error) {
    console.error("getAllCompanies error:", error);
    res.status(500).json({ message: "حدث خطأ في جلب الشركات" });
  }
};


// جلب شركة عبر ID من الباراميتر (للأدمن مثلاً)
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id; // ✅ تعديل هنا
    console.log("Fetching company with id:", companyId);

    const company = await Company.findById(companyId);

    if (!company) {
      console.log("No company data found");
      return res.status(404).json({ message: "الشركة غير موجودة" });
    }

    res.json(company);
  } catch (error) {
    console.error("getCompanyById error:", error);
    res.status(500).json({ message: "حدث خطأ في جلب بيانات الشركة" });
  }
};


export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log("No user in req");
      return res.status(401).json({ message: "Unauthorized: no user found" });
    }

    console.log("REQ.USER:", req.user);

    let company = await Company.findOne({ _id: req.user._id });
    console.log("Company found by user field:", company);

    if (!company) {
      company = await Company.findById(req.user._id);
      console.log("Company found by ID:", company);
    }

    if (!company) {
      console.log("No company found");
      return res.status(404).json({ message: "الشركة غير موجودة" });
    }

    res.json(company);
  } catch (error) {
    console.error("Error in getCompanyProfile:", error);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};




export const createOffer = async (req: Request, res: Response) => {
  console.log("Uploaded file:", req.file);
  try {
    const {
      title,
      oldPrice,
      newPrice,
      duration,
      details,
      type,
    } = req.body;

    const companyId = req.user?._id; // جاي من middleware
    if (!companyId) return res.status(403).json({ message: "شركة غير مصرح لها" });

    // التحقق من الحقول المطلوبة بناءً على نوع العرض
    if (!title) {
      return res.status(400).json({ message: "برجاء ملء الحقول الناقصة" });
    }

    if ((type === "image" || type === "video") && !req.file) {
      return res.status(400).json({ message: "برجاء رفع ملف للصورة أو الفيديو" });
    }

    const offerData: any = {
      company: companyId,
      companyModel: "Company",
      title,
      type,
      oldPrice,
      newPrice,
      duration,
      details,
    };
    const getFullUrl = (req: Request, path: string) =>
  `${req.protocol}://${req.get("host")}${path}`;


    if (req.file) {
      offerData.mediaUrl = `${req.protocol}://${req.get("host")}/uploads/offers/${req.file.filename}`;

    }

    const newOffer = await Offer.create(offerData);
    console.log("Company ID used for offer:", companyId);

    res.status(201).json(newOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ أثناء حفظ العرض" });
  }
};


export const getAllOffers = async (req: Request, res: Response) => {
  console.log("✅ دخل على getAllOffers");
  try {
    const offers = await Offer.find().populate("company", "name location");
    res.status(200).json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ message: "خطأ في جلب العروض" });
  }
};


export const loginCompany = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email }).select("+password");;

    if (!company) {
      return res.status(404).json({ message: "البريد الإلكتروني غير مسجل" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    }

    // ✅ التحقق من حالة الشركة
    if (company.status === "pending") {
      return res.status(403).json({
        message: "حسابك قيد المراجعة من قبل الإدارة. سيتم إشعارك عند التفعيل.",
      });
    }

    if (company.status === "rejected") {
      return res.status(403).json({
        message: "تم رفض طلب الانضمام. يرجى التواصل مع الدعم لمزيد من التفاصيل.",
      });
    }

    // ✅ إنشاء التوكن
    const token = jwt.sign(
      { id: company._id, role: "company" },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error);
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
  }
};


// ✅ جلب الشركات المفعّلة فقط، مرتبة حسب تاريخ التفعيل
export const getActiveCompaniesOrdered = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({ status: "active" })
      .sort({ approvedAt: -1 }) // ✅ الأحدث تفعيلًا أولاً
      .select("name logo address phone location city"); // اختياري: رجّع بس الحقول المطلوبة

    res.json(companies);
  } catch (error) {
    console.error("❌ getActiveCompaniesOrdered error:", error);
    res.status(500).json({ message: "فشل في جلب الشركات المفعّلة" });
  }
};

