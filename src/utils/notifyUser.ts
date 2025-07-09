// utils/notifyUser.ts

import Notification from "../models/Notification";
import User from "../models/User";
import { sendPushNotification } from "./sendPushNotification";

/**
 * إرسال إشعار للمستخدم وتخزينه في قاعدة البيانات
 * @param userId آي دي المستخدم اللي هيوصل له الإشعار
 * @param title عنوان الإشعار
 * @param message محتوى الإشعار
 */
export const notifyUser = async (
  userId: string,
  title: string,
  message: string
) => {
  try {
    // 1. حفظ الإشعار في قاعدة البيانات
    await Notification.create({
      userId,
      title,
      message,
    });

    // 2. جلب التوكن الخاص بالمستخدم
    const user = await User.findById(userId);
    if (!user || !user.expoPushToken) return;

    // 3. إرسال الإشعار
    await sendPushNotification(user.expoPushToken, title, message);
  } catch (err) {
    console.error("❌ فشل في notifyUser:", err);
  }
};
