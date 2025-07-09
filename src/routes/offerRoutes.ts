import express from "express";
import { getApprovedOffers } from "../controllers/offerController";
import { protect } from "../middlewares/authMiddleware"; // لو عايز حماية
import { deleteOffer } from "../controllers/offerAdminController";
import { authorize } from "../middlewares/roleMiddleware";
const router = express.Router();

// مسار جلب العروض المقبولة للمستخدمين
router.get("/approved", protect, getApprovedOffers);
router.delete("/:id", protect, authorize(["admin"]), deleteOffer);

export default router;
