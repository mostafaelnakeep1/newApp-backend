"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.sendNotificationToGroup = exports.saveExpoPushToken = exports.markAsRead = exports.getUserNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = __importDefault(require("../models/User"));
const notifications_1 = require("../utils/notifications");
/**
 * 📥 جلب كل إشعارات المستخدم
 */
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        const notifications = await Notification_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json({ notifications });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في جلب الإشعارات", error });
    }
};
exports.getUserNotifications = getUserNotifications;
/**
 * ✅ تعليم إشعار كمقروء
 */
const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user?.id;
        const notification = await Notification_1.default.findOne({ _id: notificationId, userId });
        if (!notification) {
            return res.status(404).json({ message: "الإشعار غير موجود" });
        }
        notification.isRead = true;
        await notification.save();
        res.json({ message: "تم وضع علامة مقروء" });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في تحديث الإشعار", error });
    }
};
exports.markAsRead = markAsRead;
/**
 * 📲 حفظ Expo Push Token للمستخدم
 */
const saveExpoPushToken = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { token } = req.body;
        if (!token || !token.startsWith("ExponentPushToken")) {
            return res.status(400).json({ message: "توكن غير صالح" });
        }
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "المستخدم غير موجود" });
        user.expoPushToken = token;
        await user.save();
        res.json({ message: "تم حفظ توكن الإشعارات بنجاح" });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في حفظ التوكن", error });
    }
};
exports.saveExpoPushToken = saveExpoPushToken;
const sendNotificationToGroup = async (req, res) => {
    console.log("📥 req.body =>", req.body);
    console.log("Authorization header:", req.headers.authorization);
    const { title, message, targetGroup } = req.body;
    if (!title || !message || !targetGroup) {
        return res.status(400).json({ message: "كل الحقول مطلوبة" });
    }
    try {
        let users = [];
        if (targetGroup === "all") {
            users = await User_1.default.find({});
        }
        else {
            users = await User_1.default.find({ role: targetGroup });
        }
        if (!users.length) {
            return res.status(404).json({ message: "لا يوجد مستخدمين في هذه الفئة" });
        }
        await Promise.all(users.map(async (user) => {
            // 1. حفظ الإشعار في قاعدة البيانات
            await Notification_1.default.create({
                userId: user._id,
                title,
                message,
                isRead: false,
                type: "تنبيه جماعي",
            });
            // 2. إرسال Push Notification
            if (user.expoPushToken) {
                await (0, notifications_1.sendNotificationAndPush)(user.expoPushToken, title, message);
            }
        }));
        return res.status(200).json({ message: `تم إرسال الإشعار لـ ${users.length} مستخدم` });
    }
    catch (error) {
        console.error("❌ Error أثناء الإرسال:", error);
        return res.status(500).json({ message: "حدث خطأ أثناء إرسال الإشعار" });
    }
};
exports.sendNotificationToGroup = sendNotificationToGroup;
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification_1.default.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
        res.status(200).json({ message: "تم تحديد جميع الإشعارات كمقروءة" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ في تحديث الإشعارات" });
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
