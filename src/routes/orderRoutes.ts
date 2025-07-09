import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validate";
import { createOrderSchema } from "../validation/orderValidation";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  rateOrder
} from "../controllers/orderController";
import { authorize } from "../middlewares/roleMiddleware";

const router = express.Router();

router.use(protect); // يحمي كل الروترات ويضيف req.user

// إنشاء طلب - فقط العملاء
router.post("/", authorize(["client"]), validateBody(createOrderSchema), createOrder);

// جلب الطلبات - كل الأدوار
router.get("/", authorize(["client", "company", "admin"]), getOrders);

// تعديل الطلب (مثلاً تعديل بيانات عامة) - للعملاء فقط
router.put("/:id", authorize(["client"]), updateOrder);

// حذف الطلب - للعملاء فقط
router.delete("/:id", authorize(["client"]), deleteOrder);

// تحديث حالة الطلب - للشركات والأدمن فقط (PATCH أنسب لتعديل جزئي)
router.patch("/:id/status", authorize(["admin", "company"]), updateOrderStatus);

//تقييم المنتج
router.post("/:orderId/rate", protect, authorize(["client"]), rateOrder);


export default router;
