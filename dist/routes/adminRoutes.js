"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // لازم تضيف استيراد bcrypt هنا
const User_1 = __importDefault(require("../models/User"));
const Company_1 = __importDefault(require("../models/Company"));
const authController_1 = require("../controllers/authController");
const offerAdminController_1 = require("../controllers/offerAdminController");
const companyController_1 = require("../controllers/companyController");
const statsController_1 = require("../controllers/statsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const notificationController_1 = require("../controllers/notificationController");
const adminCompanyController_1 = require("../controllers/adminCompanyController");
const router = express_1.default.Router();
// كل الراوتات الخاصة بالأدمن
router.use(authMiddleware_1.protect);
router.use((0, roleMiddleware_1.authorize)(["admin"]));
router.get("/users", authController_1.getAllUsers);
router.get("/users/filter", authController_1.getAllUsers); // لو filterUsers مختلف غير getAllUsers استبدلها
router.get("/users/:userId", authController_1.getUserById);
router.delete("/users/:userId", authController_1.deleteUser);
router.patch("/users/:userId", authController_1.updateUser);
router.patch("/users/:userId/promote", authController_1.promoteToAdmin);
router.patch("/users/:userId/demote", authController_1.demoteAdmin);
router.delete("/users/:userId", authController_1.softDeleteUser);
router.get("/companies", companyController_1.getAllCompanies);
router.patch("/users/:userId/restore", authController_1.restoreUser);
router.put("/companies/:id/approve", authController_1.approveCompany);
router.get("/companies/pending", authController_1.getPendingCompanies);
router.get("/companies/:companyId", companyController_1.getCompanyById);
router.get("/companies/suspended", statsController_1.getSuspendedCompanies);
router.patch("/companies/:companyId/suspension", statsController_1.updateCompanySuspension);
router.get("/companies/with-remaining-days", statsController_1.getCompaniesWithRemainingDays);
router.post("/notifications", notificationController_1.sendNotificationToGroup);
router.put("/companies/:id/reject", authController_1.rejectCompany);
router.get("/offers/pending", offerAdminController_1.getPendingOffers);
router.put("/offers/:id/approve", offerAdminController_1.approveOffer);
router.put("/offers/:id/reject", offerAdminController_1.rejectOffer);
router.patch("/companies/:id/pause", adminCompanyController_1.pauseCompany);
router.patch("/companies/:id/extend", adminCompanyController_1.extendCompany);
router.patch("/companies/:id/unpause", adminCompanyController_1.unpauseCompany);
// إضافة إنشاء حساب مستخدم لشركة معلقة
router.post('/companies/:id/create-user', async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company_1.default.findById(companyId);
        if (!company)
            return res.status(404).json({ message: "شركة غير موجودة" });
        if (company.user)
            return res.status(400).json({ message: "هذه الشركة مرتبطة بالفعل بحساب مستخدم" });
        const defaultPassword = "password123";
        const existingUser = await User_1.default.findOne({ email: company.email });
        if (existingUser) {
            const companyUsingUser = await Company_1.default.findOne({ user: existingUser._id });
            if (companyUsingUser) {
                return res.status(400).json({ message: "البريد الإلكتروني مرتبط بشركة أخرى بالفعل" });
            }
            // ربط المستخدم الحالي بالشركة
            company.user = existingUser._id;
            await company.save();
            return res.status(200).json({ message: "تم ربط الشركة بالمستخدم الموجود", userId: existingUser._id });
        }
        // إنشاء مستخدم جديد وربطه
        const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, 10);
        const newUser = new User_1.default({
            name: company.name,
            email: company.email,
            password: hashedPassword,
            role: "company",
        });
        await newUser.save();
        company.user = newUser._id;
        await company.save();
        res.status(201).json({ message: "تم إنشاء حساب جديد وربطه بالشركة", userId: newUser._id, defaultPassword });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ في السيرفر" });
    }
});
exports.default = router;
