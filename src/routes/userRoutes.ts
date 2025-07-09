import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleSuspendStatus,
  toggleVisibilityStatus,
  updateOwnProfile,
} from "../controllers/userController";
import {
  getClientCount,
  getCompanyCount,
  getMonthlySales,
  getTotalSales,
  getCompanySalesStats,
} from "../controllers/statsController";
import { validateBody } from "../middlewares/validate";
import { updateUserSchema  } from "../validation/userValidation";
import { saveExpoPushToken } from "../controllers/userController";


const router = express.Router();

// 📌 راوت لتحديث بيانات المستخدم نفسه - متاح لكل مستخدم مسجل فقط
router.put("/me", protect, updateOwnProfile);
router.put("/save-token", protect, saveExpoPushToken);
// 📊 إحصائيات - محمية للأدمن فقط
router.use(protect);
router.use(authorize(["admin"]));

router.get("/stats/clients-count", getClientCount);
router.get("/stats/companies-count", getCompanyCount);
router.get("/stats/monthly-sales", getMonthlySales);
router.get("/stats/total-sales", getTotalSales);
router.get("/stats/company-sales/:companyId", getCompanySalesStats);

// 🧑‍💼 راوتات إدارة المستخدمين - محمية للأدمن فقط
router.get("/", getUsers);
router.get("/:id", getUserById);

router.put("/:id", validateBody(updateUserSchema), updateUser);

router.delete("/:id", deleteUser);

router.put("/:id/suspend", toggleSuspendStatus);

router.put("/:id/hide", toggleVisibilityStatus);


export default router;
