"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = void 0;
// ✅ استخدم نسخة واحدة للداتا، بدون إلزام الشركة تبعت companyId
const joi_1 = __importDefault(require("joi"));
exports.createProductSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(50).optional(),
    description: joi_1.default.string().max(500).optional().allow(""),
    price: joi_1.default.number().positive().required(),
    type: joi_1.default.string().required(),
    capacity: joi_1.default.number().required(),
    brand: joi_1.default.string().required(),
    installDuration: joi_1.default.number().required(),
    companyId: joi_1.default.string().optional(), // 🟡 بقت optional
});
