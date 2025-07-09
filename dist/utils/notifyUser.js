"use strict";
// utils/notifyUser.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUser = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = __importDefault(require("../models/User"));
const sendPushNotification_1 = require("./sendPushNotification");
/**
 * إرسال إشعار للمستخدم وتخزينه في قاعدة البيانات
 * @param userId آي دي المستخدم اللي هيوصل له الإشعار
 * @param title عنوان الإشعار
 * @param message محتوى الإشعار
 */
const notifyUser = async (userId, title, message) => {
    try {
        // 1. حفظ الإشعار في قاعدة البيانات
        await Notification_1.default.create({
            userId,
            title,
            message,
        });
        // 2. جلب التوكن الخاص بالمستخدم
        const user = await User_1.default.findById(userId);
        if (!user || !user.expoPushToken)
            return;
        // 3. إرسال الإشعار
        await (0, sendPushNotification_1.sendPushNotification)(user.expoPushToken, title, message);
    }
    catch (err) {
        console.error("❌ فشل في notifyUser:", err);
    }
};
exports.notifyUser = notifyUser;
