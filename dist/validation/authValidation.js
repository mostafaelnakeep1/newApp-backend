"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// تحقق بيانات التسجيل
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(30).required().messages({
        "string.empty": "الاسم مطلوب",
        "string.min": "الاسم لازم يكون 3 أحرف على الأقل",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.email": "صيغة البريد الإلكتروني غير صحيحة",
        "string.empty": "البريد الإلكتروني مطلوب",
    }),
    password: joi_1.default.string().min(6).required().messages({
        "string.min": "كلمة المرور لازم تكون 6 أحرف على الأقل",
        "string.empty": "كلمة المرور مطلوبة",
    }),
    role: joi_1.default.string().valid("client", "company").required().messages({
        "any.only": "الدور لازم يكون client أو company",
        "string.empty": "الدور مطلوب",
    }),
});
// تحقق بيانات تسجيل الدخول
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "صيغة البريد الإلكتروني غير صحيحة",
        "string.empty": "البريد الإلكتروني مطلوب",
    }),
    password: joi_1.default.string().required().messages({
        "string.empty": "كلمة المرور مطلوبة",
    }),
});
