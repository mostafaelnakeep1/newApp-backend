import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "client" | "company" | "admin";
  isSuspended: boolean;
  suspendAfterDays: number; // قابل للتعديل من الأدمن
  activatedAt: Date; // تاريخ التفعيل (أو التسجيل)
  isHidden: boolean;
  profileImage?: string;
  isDeleted: boolean;
  companyImages?: string[];
  address?: string;
  logo?: string;
  companyId?: string;
  expoPushToken?: string;
  resetCode?: string;
resetCodeExpires?: Date;
  location?: {
    lat: number;
    lng: number;
  };
  coverageAreas?: string[];
  _id: Types.ObjectId;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["client", "company", "admin"],
      default: "client",
      required: true,
    },

    isSuspended: { type: Boolean, default: false },
    suspendAfterDays: { type: Number, default: 30 },
    activatedAt: { type: Date, default: Date.now },

    isHidden: { type: Boolean, default: false },
    profileImage: { type: String, default: "" },

    companyImages: [{ type: String, default: [] }],
    isDeleted: { type: Boolean, default: false },

    expoPushToken: { type: String, default: "" },
    address: { type: String, default: "" },
    logo: { type: String, default: "" },
    
    location: {
      type: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
      },
      resetCode: {
        type: String,
        default: null,
      },

      resetCodeExpires: {
        type: Date,
        default: null,
      },
      required: false,
      default: null,
    },

    coverageAreas: [{ type: String, default: [] }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
