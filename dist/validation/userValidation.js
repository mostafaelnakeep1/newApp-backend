"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateUserSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(30).optional().messages({
        "string.min": "الاسم لازم يكون 3 أحرف على الأقل",
    }),
    email: joi_1.default.string().email().optional().messages({
        "string.email": "صيغة البريد الإلكتروني غير صحيحة",
    }),
    role: joi_1.default.string().valid("client", "company", "admin").optional().messages({
        "any.only": "الدور لازم يكون client أو company أو admin",
    }),
});
