"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createOrderSchema = joi_1.default.object({
    productId: joi_1.default.string().required().messages({
        "string.empty": "معرف المنتج مطلوب",
    }),
    quantity: joi_1.default.number().integer().min(1).required().messages({
        "number.base": "الكمية لازم تكون رقم",
        "number.min": "الكمية لازم تكون على الأقل 1",
        "any.required": "الكمية مطلوبة",
    }),
    clientId: joi_1.default.string().required().messages({
        "string.empty": "معرف العميل مطلوب",
    }),
    address: joi_1.default.string().min(5).max(200).required().messages({
        "string.empty": "العنوان مطلوب",
        "string.min": "العنوان لازم يكون على الأقل 5 أحرف",
    }),
});
