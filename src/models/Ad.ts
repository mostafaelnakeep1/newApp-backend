import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    video: { type: String, required: true }, // اسم ملف الفيديو
    position: { type: Number, required: true },
    durationDays: { type: Number, required: true },

    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },

    createdAt: { type: Date, default: Date.now },

    expiryDate: { type: Date, required: true }, // تاريخ انتهاء الإعلان
  },
  { timestamps: true }
);

export default mongoose.model("Ad", adSchema);
