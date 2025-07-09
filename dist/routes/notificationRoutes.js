"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const notificationController_1 = require("../controllers/notificationController");
const notifyUser_1 = require("../utils/notifyUser");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get("/", notificationController_1.getUserNotifications);
router.put("/mark-read/:id", notificationController_1.markAsRead);
router.put("/mark-all-read", authMiddleware_1.protect, notificationController_1.markAllNotificationsAsRead);
router.post("/save-token", notificationController_1.saveExpoPushToken);
router.post("/", notificationController_1.sendNotificationToGroup);
// مسار لإرسال إشعار يدوي (مثلاً من الأدمن)
router.post("/send-group", async (req, res) => {
    const { userId, title, message } = req.body;
    if (!userId || !title || !message) {
        return res.status(400).json({ message: "بيانات ناقصة للإرسال" });
    }
    try {
        await (0, notifyUser_1.notifyUser)(userId, title, message);
        res.json({ message: "تم إرسال الإشعار بنجاح" });
    }
    catch (error) {
        console.error("فشل في إرسال الإشعار", error);
        res.status(500).json({ message: "فشل في إرسال الإشعار" });
    }
});
exports.default = router;
