// models/Notification.ts

import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;           // المستلم (العميل أو الشركة أو الأدمن)
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedOrderId?: Types.ObjectId;  // لو الإشعار مرتبط بطلب معين (نستخدم Types.ObjectId مش string)
  type?: string;                    // نوع الإشعار (طلب، عرض، تنبيه، إلخ)
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
    type: { type: String },
  },
  { timestamps: true }
);

const Notification = model<INotification>("Notification", notificationSchema);

export default Notification;
