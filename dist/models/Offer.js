"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const offerSchema = new mongoose_1.default.Schema({
    company: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
exports.default = mongoose_1.default.model("Offer", offerSchema);
