import { Request, Response } from "express";
import Notification from "../models/Notification";
import User from "../models/User";
import { sendNotificationAndPush } from "../utils/notifications";

/**
 * 📥 جلب كل إشعارات المستخدم
 */
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب الإشعارات", error });
  }
};

/**
 * ✅ تعليم إشعار كمقروء
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user?.id;

    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
      return res.status(404).json({ message: "الإشعار غير موجود" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "تم وضع علامة مقروء" });
  } catch (error) {
    res.status(500).json({ message: "فشل في تحديث الإشعار", error });
  }
};

/**
 * 📲 حفظ Expo Push Token للمستخدم
 */
export const saveExpoPushToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!token || !token.startsWith("ExponentPushToken")) {
      return res.status(400).json({ message: "توكن غير صالح" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    user.expoPushToken = token;
    await user.save();

    res.json({ message: "تم حفظ توكن الإشعارات بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "فشل في حفظ التوكن", error });
  }
};


export const sendNotificationToGroup = async (req: Request, res: Response) => {
   console.log("📥 req.body =>", req.body);
    console.log("Authorization header:", req.headers.authorization);
  const { title, message, targetGroup } = req.body;

  if (!title || !message || !targetGroup) {
    return res.status(400).json({ message: "كل الحقول مطلوبة" });
  }

  try {
    let users = [];

    if (targetGroup === "all") {
      users = await User.find({});
    } else {
      users = await User.find({ role: targetGroup });
    }

    if (!users.length) {
      return res.status(404).json({ message: "لا يوجد مستخدمين في هذه الفئة" });
    }

    await Promise.all(
      users.map(async (user) => {
        // 1. حفظ الإشعار في قاعدة البيانات
        await Notification.create({
          userId: user._id,
          title,
          message,
          isRead: false,
          type: "تنبيه جماعي",
        });

        // 2. إرسال Push Notification
        if (user.expoPushToken) {
          await sendNotificationAndPush(user.expoPushToken, title, message);
        }
      })
    );

    return res.status(200).json({ message: `تم إرسال الإشعار لـ ${users.length} مستخدم` });
  } catch (error) {
    console.error("❌ Error أثناء الإرسال:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إرسال الإشعار" });
  }
};


export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "تم تحديد جميع الإشعارات كمقروءة" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ في تحديث الإشعارات" });
  }
};


