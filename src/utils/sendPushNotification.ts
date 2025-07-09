export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string
) => {
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title,
        body,
      }),
    });

    const data = await response.json();
    console.log("🔔 إشعار مرسل:", data);
    return data;
  } catch (err) {
    console.error("❌ فشل إرسال الإشعار:", err);
    throw err;
  }
};
