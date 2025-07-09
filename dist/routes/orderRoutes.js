"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validate_1 = require("../middlewares/validate");
const orderValidation_1 = require("../validation/orderValidation");
const orderController_1 = require("../controllers/orderController");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect); // يحمي كل الروترات ويضيف req.user
// إنشاء طلب - فقط العملاء
router.post("/", (0, roleMiddleware_1.authorize)(["client"]), (0, validate_1.validateBody)(orderValidation_1.createOrderSchema), orderController_1.createOrder);
// جلب الطلبات - كل الأدوار
router.get("/", (0, roleMiddleware_1.authorize)(["client", "company", "admin"]), orderController_1.getOrders);
// تعديل الطلب (مثلاً تعديل بيانات عامة) - للعملاء فقط
router.put("/:id", (0, roleMiddleware_1.authorize)(["client"]), orderController_1.updateOrder);
// حذف الطلب - للعملاء فقط
router.delete("/:id", (0, roleMiddleware_1.authorize)(["client"]), orderController_1.deleteOrder);
// تحديث حالة الطلب - للشركات والأدمن فقط (PATCH أنسب لتعديل جزئي)
router.patch("/:id/status", (0, roleMiddleware_1.authorize)(["admin", "company"]), orderController_1.updateOrderStatus);
//تقييم المنتج
router.post("/:orderId/rate", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["client"]), orderController_1.rateOrder);
exports.default = router;
