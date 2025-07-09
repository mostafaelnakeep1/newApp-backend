"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const userController_1 = require("../controllers/userController");
const statsController_1 = require("../controllers/statsController");
const validate_1 = require("../middlewares/validate");
const userValidation_1 = require("../validation/userValidation");
const userController_2 = require("../controllers/userController");
const router = express_1.default.Router();
// 📌 راوت لتحديث بيانات المستخدم نفسه - متاح لكل مستخدم مسجل فقط
router.put("/me", authMiddleware_1.protect, userController_1.updateOwnProfile);
router.put("/save-token", authMiddleware_1.protect, userController_2.saveExpoPushToken);
// 📊 إحصائيات - محمية للأدمن فقط
router.use(authMiddleware_1.protect);
router.use((0, roleMiddleware_1.authorize)(["admin"]));
router.get("/stats/clients-count", statsController_1.getClientCount);
router.get("/stats/companies-count", statsController_1.getCompanyCount);
router.get("/stats/monthly-sales", statsController_1.getMonthlySales);
router.get("/stats/total-sales", statsController_1.getTotalSales);
router.get("/stats/company-sales/:companyId", statsController_1.getCompanySalesStats);
// 🧑‍💼 راوتات إدارة المستخدمين - محمية للأدمن فقط
router.get("/", userController_1.getUsers);
router.get("/:id", userController_1.getUserById);
router.put("/:id", (0, validate_1.validateBody)(userValidation_1.updateUserSchema), userController_1.updateUser);
router.delete("/:id", userController_1.deleteUser);
router.put("/:id/suspend", userController_1.toggleSuspendStatus);
router.put("/:id/hide", userController_1.toggleVisibilityStatus);
exports.default = router;
