import joi from "joi";
import validatorMiddleware from "../../middlewares/validatorMiddleware";

const bookAppointmentSchema = joi.object({
  doctorId: joi.string().hex().length(24).required().messages({
    "any.required": "معرف الطبيب مطلوب",
  }),
  date: joi.date().min("now").required().messages({
    "date.min": "يجب أن يكون تاريخ الحجز في المستقبل",
    "any.required": "تاريخ الحجز مطلوب",
  }),
  slotTime: joi.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/).required().messages({
    "string.pattern.base": "تنسيق الوقت غير صحيح (مثال: 09:00 AM)",
  }),
  appointmentType: joi.string().valid("consultation", "follow_up").default("consultation"),
  notes: joi.string().max(500).allow(""),
  patientId: joi.string().hex().length(24).messages({
    "string.length": "معرف المريض غير صحيح",
  }),
});

export const validateBookAppointment = validatorMiddleware({
  body: bookAppointmentSchema,
});
