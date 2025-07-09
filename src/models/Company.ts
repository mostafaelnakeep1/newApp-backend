import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICompany extends Document {
  name: string;
  user?: Types.ObjectId;
  address?: string;
  email?: string;
  phone?: string;
  password: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  isActive?: boolean;             
  subscriptionEnd?: Date;
  coverageAreas?: string[];
  createdAt: Date;
  isSuspended?: boolean;
  productsCount?: number;
  permissionsGranted?: boolean;
  ordersCount?: number;
  logo?: string;
  city?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  expoPushToken?: string;
  interactedClients: mongoose.Types.ObjectId[];
  lastInteraction?: Date;
  status: "pending" | "active" | "rejected"; // ✅ الحقل الجديد
}

const companySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    email: { type: String },
    phone: String,
    logo: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      isActive: { type: Boolean, default: false },
      subscriptionEnd: { type: Date }, 
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    password: { type: String, required: true, select: false }, // ✅ أضف ده هنا
    coverageAreas: [{ type: String }],
    isSuspended: { type: Boolean, default: false },
    productsCount: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    city: String,
    interactedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastInteraction: Date,
    expoPushToken: { type: String },

    // ✅ الحالة الجديدة: معلقة، مفعلة، مرفوضة
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
     permissionsGranted: {
      type: Boolean,
      default: false, // ⛔ ممنوع يشتغل لحد ما الأدمن يوافق
    },
    approvedAt: Date,   // ✅ تاريخ التفعيل
    rejectedAt: Date,   // ✅ تاريخ الرفض
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>("Company", companySchema);
