// utils/notifications.ts

import axios from "axios";

export const sendNotificationAndPush = async (
  expoPushToken: string,
  title: string,
  body: string
) => {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title,
      body,
    });
  } catch (err) {
    console.error("فشل إرسال الإشعار:", err);
  }
};
