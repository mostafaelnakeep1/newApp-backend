"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User")); // مفيش داعي لـ Company طالما الكل هنا
const attachUser = async (req, res, next) => {
    console.log("🔥 attachUser middleware loaded");
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("🚫 No token provided");
            return next();
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("🧩 Decoded Token:", decoded);
        const user = await User_1.default.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        req.user = {
            ...user.toObject(),
            role: decoded.role,
        };
        next();
    }
    catch (err) {
        console.error("💥 Error in attachUser:", err);
        res.status(401).json({ message: "Token غير صالح أو منتهي" });
    }
};
exports.attachUser = attachUser;
