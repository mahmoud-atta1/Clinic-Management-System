import joi from "joi";
import validatorMiddleware from "../../middlewares/validatorMiddleware";

const createSpecializationSchema = joi.object({
  name: joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "اسم التخصص مطلوب",
    "string.min": "يجب أن يكون اسم التخصص حرفين على الأقل",
    "any.required": "اسم التخصص مطلوب",
  }),
  description: joi.string().trim().max(500).allow(""),
});

const updateSpecializationSchema = joi.object({
  name: joi.string().trim().min(2).max(50),
  description: joi.string().trim().max(500).allow(""),
});

export const validateCreateSpecialization = validatorMiddleware({
  body: createSpecializationSchema,
});

export const validateUpdateSpecialization = validatorMiddleware({
  body: updateSpecializationSchema,
});
