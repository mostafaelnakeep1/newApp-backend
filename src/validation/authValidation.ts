import Joi from "joi";

// تحقق بيانات التسجيل
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "الاسم لازم يكون 3 أحرف على الأقل",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "صيغة البريد الإلكتروني غير صحيحة",
    "string.empty": "البريد الإلكتروني مطلوب",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "كلمة المرور لازم تكون 6 أحرف على الأقل",
    "string.empty": "كلمة المرور مطلوبة",
  }),
  role: Joi.string().valid("client", "company").required().messages({
    "any.only": "الدور لازم يكون client أو company",
    "string.empty": "الدور مطلوب",
  }),
});

// تحقق بيانات تسجيل الدخول
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "صيغة البريد الإلكتروني غير صحيحة",
    "string.empty": "البريد الإلكتروني مطلوب",
  }),
  password: Joi.string().required().messages({
    "string.empty": "كلمة المرور مطلوبة",
  }),
});
