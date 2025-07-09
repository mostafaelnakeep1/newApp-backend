"use strict";
// utils/notifications.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationAndPush = void 0;
const axios_1 = __importDefault(require("axios"));
const sendNotificationAndPush = async (expoPushToken, title, body) => {
    try {
        await axios_1.default.post("https://exp.host/--/api/v2/push/send", {
            to: expoPushToken,
            sound: "default",
            title,
            body,
        });
    }
    catch (err) {
        console.error("فشل إرسال الإشعار:", err);
    }
};
exports.sendNotificationAndPush = sendNotificationAndPush;
