"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const offerController_1 = require("../controllers/offerController");
const authMiddleware_1 = require("../middlewares/authMiddleware"); // لو عايز حماية
const offerAdminController_1 = require("../controllers/offerAdminController");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
// مسار جلب العروض المقبولة للمستخدمين
router.get("/approved", authMiddleware_1.protect, offerController_1.getApprovedOffers);
router.delete("/:id", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), offerAdminController_1.deleteOffer);
exports.default = router;
