import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { attachUser } from "../middlewares/attachUser";
import { authorize } from "../middlewares/roleMiddleware";
import { getCompanySalesStats, getDashboardStats } from "../controllers/dashboardController";

const router = express.Router();

router.get("/stats", protect, attachUser, authorize(["admin"]), getDashboardStats);
router.get("/company-sales", protect, attachUser, authorize(["company"]),
  getCompanySalesStats
);

export default router;
