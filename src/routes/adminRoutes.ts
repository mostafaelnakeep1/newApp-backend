import express from "express";
import bcrypt from "bcryptjs"; // لازم تضيف استيراد bcrypt هنا
import User from "../models/User";
import Company from "../models/Company";

import {
  deleteUser,
  updateUser,
  promoteToAdmin,
  demoteAdmin,
  softDeleteUser,
  restoreUser,
  getAllUsers,
  getUserById,
  getPendingCompanies,
  approveCompany,
  rejectCompany,
} from "../controllers/authController";
import {
  approveOffer,
  rejectOffer,
  getPendingOffers,
} from "../controllers/offerAdminController";
import { getAllCompanies, getCompanyById } from "../controllers/companyController";
import { updateCompanySuspension, getSuspendedCompanies, getCompaniesWithRemainingDays } from "../controllers/statsController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { sendNotificationToGroup } from "../controllers/notificationController";
import { pauseCompany, extendCompany, unpauseCompany} from "../controllers/adminCompanyController";


const router = express.Router();


// كل الراوتات الخاصة بالأدمن
router.use(protect);
router.use(authorize(["admin"]));

router.get("/users", getAllUsers);
router.get("/users/filter", getAllUsers); // لو filterUsers مختلف غير getAllUsers استبدلها
router.get("/users/:userId", getUserById);
router.delete("/users/:userId", deleteUser);
router.patch("/users/:userId", updateUser);
router.patch("/users/:userId/promote", promoteToAdmin);
router.patch("/users/:userId/demote", demoteAdmin);
router.delete("/users/:userId", softDeleteUser);
router.get("/companies", getAllCompanies);
router.patch("/users/:userId/restore", restoreUser);
router.put("/companies/:id/approve", approveCompany);
router.get("/companies/pending", getPendingCompanies);
router.get("/companies/:companyId", getCompanyById);
router.get("/companies/suspended", getSuspendedCompanies);
router.patch("/companies/:companyId/suspension", updateCompanySuspension);
router.get("/companies/with-remaining-days", getCompaniesWithRemainingDays);
router.post("/notifications", sendNotificationToGroup);
router.put("/companies/:id/reject", rejectCompany);
router.get("/offers/pending", getPendingOffers);
router.put("/offers/:id/approve", approveOffer);
router.put("/offers/:id/reject", rejectOffer);
router.patch("/companies/:id/pause", pauseCompany);
router.patch("/companies/:id/extend", extendCompany);
router.patch("/companies/:id/unpause", unpauseCompany);


// إضافة إنشاء حساب مستخدم لشركة معلقة
router.post('/companies/:id/create-user', async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "شركة غير موجودة" });

    if (company.user) return res.status(400).json({ message: "هذه الشركة مرتبطة بالفعل بحساب مستخدم" });

    const defaultPassword = "password123";

    const existingUser = await User.findOne({ email: company.email });

    if (existingUser) {
      const companyUsingUser = await Company.findOne({ user: existingUser._id });

      if (companyUsingUser) {
        return res.status(400).json({ message: "البريد الإلكتروني مرتبط بشركة أخرى بالفعل" });
      }

      // ربط المستخدم الحالي بالشركة
      company.user = existingUser._id;
      await company.save();

      return res.status(200).json({ message: "تم ربط الشركة بالمستخدم الموجود", userId: existingUser._id });
    }

    // إنشاء مستخدم جديد وربطه
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = new User({
      name: company.name,
      email: company.email,
      password: hashedPassword,
      role: "company",
    });

    await newUser.save();

    company.user = newUser._id;
    await company.save();

    res.status(201).json({ message: "تم إنشاء حساب جديد وربطه بالشركة", userId: newUser._id, defaultPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});


export default router;
