// routes/profileRoutes.ts
import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { attachUser } from "../middlewares/attachUser";
import { updateOwnProfile, getPreviousCompanies  } from "../controllers/userController";
import { validateBody } from "../middlewares/validate";
import { updateUserSchema } from "../validation/userValidation";



const router = express.Router();

router.use(protect);
router.use(attachUser);

// تعديل بيانات المستخدم الحالي
router.put("/", validateBody(updateUserSchema), updateOwnProfile);

// الشركات اللي اتعامل معاها المستخدم سابقًا
router.get("/previous-companies", getPreviousCompanies);

export default router;
