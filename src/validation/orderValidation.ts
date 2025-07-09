import Joi from "joi";

export const createOrderSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.empty": "معرف المنتج مطلوب",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "الكمية لازم تكون رقم",
    "number.min": "الكمية لازم تكون على الأقل 1",
    "any.required": "الكمية مطلوبة",
  }),
  clientId: Joi.string().required().messages({
    "string.empty": "معرف العميل مطلوب",
  }),
  address: Joi.string().min(5).max(200).required().messages({
    "string.empty": "العنوان مطلوب",
    "string.min": "العنوان لازم يكون على الأقل 5 أحرف",
  }),
});
