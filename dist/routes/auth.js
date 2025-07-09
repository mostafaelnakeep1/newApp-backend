"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const attachUser_1 = require("../middlewares/attachUser");
const validate_1 = require("../middlewares/validate");
const authValidation_1 = require("../validation/authValidation");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = express_1.default.Router();
router.post("/company/login", authController_1.login);
router.post("/login", (0, validate_1.validateBody)(authValidation_1.loginSchema), authController_1.login);
router.post("/register", uploadMiddleware_1.upload.single("image"), authController_1.register);
router.post("/company/register", uploadMiddleware_1.upload.single("image"), authController_1.register);
router.post("/send-reset-code", authController_1.sendResetCode);
router.post("/verify-reset-code", authController_1.verifyResetCode);
router.post("/reset-password", authController_1.resetPassword);
router.patch("/me/update", authMiddleware_1.protect, authController_1.updateMyProfile);
router.patch("/me/password", authMiddleware_1.protect, authController_1.updatePassword);
router.patch("/me/profile-details", authMiddleware_1.protect, authController_1.updateProfileDetails);
router.get("/company-only", authMiddleware_1.protect, attachUser_1.attachUser, (0, roleMiddleware_1.authorize)(["company"]), (req, res) => {
    res.json({ message: "مرحبًا بك أيها التاجر", user: req.user });
});
router.get("/admin-only", authMiddleware_1.protect, attachUser_1.attachUser, (0, roleMiddleware_1.authorize)(["admin"]), (req, res) => {
    res.json({ message: "أهلاً يا أدمن 🔐", user: req.user });
});
router.get("/protected", authMiddleware_1.protect, attachUser_1.attachUser, (req, res) => {
    res.json({ message: "You are authorized", user: req.user });
});
exports.default = router;
