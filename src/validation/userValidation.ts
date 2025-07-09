import Joi from "joi";

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).optional().messages({
    "string.min": "الاسم لازم يكون 3 أحرف على الأقل",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "صيغة البريد الإلكتروني غير صحيحة",
  }),
  role: Joi.string().valid("client", "company", "admin").optional().messages({
    "any.only": "الدور لازم يكون client أو company أو admin",
  }),
});
