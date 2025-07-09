"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const companySchema = new mongoose_1.Schema({
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
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: false },
    password: { type: String, required: true, select: false }, // ✅ أضف ده هنا
    coverageAreas: [{ type: String }],
    isSuspended: { type: Boolean, default: false },
    productsCount: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    city: String,
    interactedClients: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
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
    approvedAt: Date, // ✅ تاريخ التفعيل
    rejectedAt: Date, // ✅ تاريخ الرفض
}, { timestamps: true });
exports.default = mongoose_1.default.model("Company", companySchema);
