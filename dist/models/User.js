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
const UserSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", UserSchema);
