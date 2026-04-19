import joi from "joi";
import validatorMiddleware from "../../middlewares/validatorMiddleware";

const addDoctorSchema = joi.object({
  userId: joi.string().hex().length(24).required().messages({
    "string.length": "معرف المستخدم غير صحيح",
    "any.required": "معرف المستخدم مطلوب",
  }),
  specializationId: joi.string().hex().length(24).required().messages({
    "string.length": "معرف التخصص غير صحيح",
    "any.required": "معرف التخصص مطلوب",
  }),
  consultationFee: joi.number().min(0).required().messages({
    "number.base": "رسوم الكشف يجب أن تكون رقماً",
    "any.required": "رسوم الكشف مطلوبة",
  }),
  followUpFee: joi.number().min(0).required().messages({
    "number.base": "رسوم الإعادة يجب أن تكون رقماً",
    "any.required": "رسوم الإعادة مطلوبة",
  }),
  availableDays: joi.array().items(joi.string()).min(1).required().messages({
    "array.min": "يجب اختيار يوم واحد على الأقل",
    "any.required": "أيام التوافر مطلوبة",
  }),
  startTime: joi.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/).required().messages({
    "string.pattern.base": "تنسيق الوقت غير صحيح (مثال: 09:00 AM)",
  }),
  endTime: joi.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/).required().messages({
    "string.pattern.base": "تنسيق الوقت غير صحيح (مثال: 05:00 PM)",
  }),
  slotDuration: joi.number().min(5).max(120).default(30),
});

const updateDoctorSchema = joi.object({
  consultationFee: joi.number().min(0),
  followUpFee: joi.number().min(0),
  availableDays: joi.array().items(joi.string()).min(1),
  startTime: joi.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
  endTime: joi.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
  slotDuration: joi.number().min(5).max(120),
  specializationId: joi.string().hex().length(24),
});

export const validateAddDoctor = validatorMiddleware({
  body: addDoctorSchema,
});

export const validateUpdateDoctor = validatorMiddleware({
  body: updateDoctorSchema,
});
