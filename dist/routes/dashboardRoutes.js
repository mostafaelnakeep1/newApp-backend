"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const attachUser_1 = require("../middlewares/attachUser");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
router.get("/stats", authMiddleware_1.protect, attachUser_1.attachUser, (0, roleMiddleware_1.authorize)(["admin"]), dashboardController_1.getDashboardStats);
router.get("/company-sales", authMiddleware_1.protect, attachUser_1.attachUser, (0, roleMiddleware_1.authorize)(["company"]), dashboardController_1.getCompanySalesStats);
exports.default = router;
