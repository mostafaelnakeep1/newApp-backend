"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const adSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
exports.default = mongoose_1.default.model("Ad", adSchema);
