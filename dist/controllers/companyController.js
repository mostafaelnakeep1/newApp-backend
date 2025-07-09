"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveCompaniesOrdered = exports.loginCompany = exports.getAllOffers = exports.createOffer = exports.getCompanyProfile = exports.getCompanyById = exports.getAllCompanies = void 0;
const Company_1 = __importDefault(require("../models/Company")); // تأكد إن مسار الموديل صح عندك
const Offer_1 = __importDefault(require("../models/Offer"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// جلب كل الشركات
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company_1.default.find({});
        res.status(200).json(companies);
    }
    catch (error) {
        console.error("getAllCompanies error:", error);
        res.status(500).json({ message: "حدث خطأ في جلب الشركات" });
    }
};
exports.getAllCompanies = getAllCompanies;
// جلب شركة عبر ID من الباراميتر (للأدمن مثلاً)
const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id; // ✅ تعديل هنا
        console.log("Fetching company with id:", companyId);
        const company = await Company_1.default.findById(companyId);
        if (!company) {
            console.log("No company data found");
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }
        res.json(company);
    }
    catch (error) {
        console.error("getCompanyById error:", error);
        res.status(500).json({ message: "حدث خطأ في جلب بيانات الشركة" });
    }
};
exports.getCompanyById = getCompanyById;
const getCompanyProfile = async (req, res) => {
    try {
        if (!req.user) {
            console.log("No user in req");
            return res.status(401).json({ message: "Unauthorized: no user found" });
        }
        console.log("REQ.USER:", req.user);
        let company = await Company_1.default.findOne({ _id: req.user._id });
        console.log("Company found by user field:", company);
        if (!company) {
            company = await Company_1.default.findById(req.user._id);
            console.log("Company found by ID:", company);
        }
        if (!company) {
            console.log("No company found");
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }
        res.json(company);
    }
    catch (error) {
        console.error("Error in getCompanyProfile:", error);
        res.status(500).json({ message: "خطأ في السيرفر" });
    }
};
exports.getCompanyProfile = getCompanyProfile;
const createOffer = async (req, res) => {
    console.log("Uploaded file:", req.file);
    try {
        const { title, oldPrice, newPrice, duration, details, type, } = req.body;
        const companyId = req.user?._id; // جاي من middleware
        if (!companyId)
            return res.status(403).json({ message: "شركة غير مصرح لها" });
        // التحقق من الحقول المطلوبة بناءً على نوع العرض
        if (!title) {
            return res.status(400).json({ message: "برجاء ملء الحقول الناقصة" });
        }
        if ((type === "image" || type === "video") && !req.file) {
            return res.status(400).json({ message: "برجاء رفع ملف للصورة أو الفيديو" });
        }
        const offerData = {
            company: companyId,
            companyModel: "Company",
            title,
            type,
            oldPrice,
            newPrice,
            duration,
            details,
        };
        const getFullUrl = (req, path) => `${req.protocol}://${req.get("host")}${path}`;
        if (req.file) {
            offerData.mediaUrl = `${req.protocol}://${req.get("host")}/uploads/offers/${req.file.filename}`;
        }
        const newOffer = await Offer_1.default.create(offerData);
        console.log("Company ID used for offer:", companyId);
        res.status(201).json(newOffer);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "خطأ أثناء حفظ العرض" });
    }
};
exports.createOffer = createOffer;
const getAllOffers = async (req, res) => {
    console.log("✅ دخل على getAllOffers");
    try {
        const offers = await Offer_1.default.find().populate("company", "name location");
        res.status(200).json(offers);
    }
    catch (error) {
        console.error("Error fetching offers:", error);
        res.status(500).json({ message: "خطأ في جلب العروض" });
    }
};
exports.getAllOffers = getAllOffers;
const loginCompany = async (req, res) => {
    const { email, password } = req.body;
    try {
        const company = await Company_1.default.findOne({ email }).select("+password");
        ;
        if (!company) {
            return res.status(404).json({ message: "البريد الإلكتروني غير مسجل" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, company.password);
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
        const token = jsonwebtoken_1.default.sign({ id: company._id, role: "company" }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" });
        res.json({ token });
    }
    catch (error) {
        console.error("خطأ في تسجيل الدخول:", error);
        res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
};
exports.loginCompany = loginCompany;
// ✅ جلب الشركات المفعّلة فقط، مرتبة حسب تاريخ التفعيل
const getActiveCompaniesOrdered = async (req, res) => {
    try {
        const companies = await Company_1.default.find({ status: "active" })
            .sort({ approvedAt: -1 }) // ✅ الأحدث تفعيلًا أولاً
            .select("name logo address phone location city"); // اختياري: رجّع بس الحقول المطلوبة
        res.json(companies);
    }
    catch (error) {
        console.error("❌ getActiveCompaniesOrdered error:", error);
        res.status(500).json({ message: "فشل في جلب الشركات المفعّلة" });
    }
};
exports.getActiveCompaniesOrdered = getActiveCompaniesOrdered;
