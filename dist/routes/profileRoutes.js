"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/profileRoutes.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const attachUser_1 = require("../middlewares/attachUser");
const userController_1 = require("../controllers/userController");
const validate_1 = require("../middlewares/validate");
const userValidation_1 = require("../validation/userValidation");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use(attachUser_1.attachUser);
// تعديل بيانات المستخدم الحالي
router.put("/", (0, validate_1.validateBody)(userValidation_1.updateUserSchema), userController_1.updateOwnProfile);
// الشركات اللي اتعامل معاها المستخدم سابقًا
router.get("/previous-companies", userController_1.getPreviousCompanies);
exports.default = router;
