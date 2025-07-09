import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getUserNotifications, 
  markAsRead, 
  saveExpoPushToken, 
  sendNotificationToGroup, 
  markAllNotificationsAsRead,
  
} from "../controllers/notificationController";
import { notifyUser } from "../utils/notifyUser";


const router = express.Router();

router.use(protect);

router.get("/", getUserNotifications);
router.put("/mark-read/:id", markAsRead);
router.put("/mark-all-read", protect, markAllNotificationsAsRead);
router.post("/save-token", saveExpoPushToken);
router.post("/", sendNotificationToGroup);

// مسار لإرسال إشعار يدوي (مثلاً من الأدمن)
router.post("/send-group", async (req, res) => {
  const { userId, title, message } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ message: "بيانات ناقصة للإرسال" });
  }

  try {
    await notifyUser(userId, title, message);
    res.json({ message: "تم إرسال الإشعار بنجاح" });
  } catch (error) {
    console.error("فشل في إرسال الإشعار", error);
    res.status(500).json({ message: "فشل في إرسال الإشعار" });
  }
});

export default router;
