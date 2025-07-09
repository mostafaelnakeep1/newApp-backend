import express from "express";
import {
  login,
  register,
  updateMyProfile,
  updatePassword,
  updateProfileDetails,
  promoteToAdmin, // لو مش مستخدم في الراوتر ده ممكن تشيله
  demoteAdmin,
  resetPassword,
  verifyResetCode,
  sendResetCode,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { attachUser } from "../middlewares/attachUser";
import { validateBody } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validation/authValidation";
import { upload } from "../middlewares/uploadMiddleware";



const router = express.Router();

router.post("/company/login", login);
router.post("/login", validateBody(loginSchema), login);
router.post("/register", upload.single("image"), register);
router.post("/company/register", upload.single("image"), register);
router.post("/send-reset-code", sendResetCode);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

router.patch("/me/update", protect, updateMyProfile);
router.patch("/me/password", protect, updatePassword);
router.patch("/me/profile-details", protect, updateProfileDetails);

router.get(
  "/company-only",
  protect,
  attachUser,
  authorize(["company"]),
  (req, res) => {
    res.json({ message: "مرحبًا بك أيها التاجر", user: req.user });
  }
);

router.get(
  "/admin-only",
  protect,
  attachUser,
  authorize(["admin"]),
  (req, res) => {
    res.json({ message: "أهلاً يا أدمن 🔐", user: req.user });
  }
);

router.get("/protected", protect, attachUser, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

export default router;
