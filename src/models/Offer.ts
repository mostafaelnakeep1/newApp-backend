import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
     company: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "companyModel", // ← بيربط حسب قيمة companyModel
    },
    companyModel: {
      type: String,
      required: true,
      enum: ["User", "Company"], // ← اسماء الموديلات الموجودة فعلاً
    },
    title: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    oldPrice: String,
    newPrice: String,
    discount: String,
    duration: String,
    details: String,
    mediaUrl: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
