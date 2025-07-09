// ✅ استخدم نسخة واحدة للداتا، بدون إلزام الشركة تبعت companyId
import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  description: Joi.string().max(500).optional().allow(""),
  price: Joi.number().positive().required(),
  type: Joi.string().required(),
  capacity: Joi.number().required(),
  brand: Joi.string().required(),
  installDuration: Joi.number().required(),
  companyId: Joi.string().optional(), // 🟡 بقت optional
});
