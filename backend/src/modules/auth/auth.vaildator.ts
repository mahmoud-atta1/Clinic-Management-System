import joi from "joi";
import validatorMiddleware from "../../middlewares/validatorMiddleware";

const signupSchema = joi
  .object({
    fullName: joi.string().trim().min(3).max(50).required().messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name must not exceed 50 characters",
      "any.required": "Full name is required",
    }),

    email: joi.string().trim().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

    password: joi.string().min(6).max(30).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must not exceed 30 characters",
      "any.required": "Password is required",
    }),

    passwordConfirm: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Password confirmation is required",
      }),

    phone: joi.string().trim().required().messages({
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),

    gender: joi.string().valid("male", "female").required().messages({
      "any.only": "Gender must be male or female",
      "any.required": "Gender is required",
    }),

    dateOfBirth: joi.date().required().messages({
      "date.base": "Date of birth must be a valid date",
      "any.required": "Date of birth is required",
    }),

    role: joi.string().valid("admin", "doctor", "receptionist", "patient").optional().messages({
      "any.only": "Invalid role specified",
    }),
  })
  .options({
    allowUnknown: false,
  })
  .messages({
    "object.unknown": "You entered a field that is not allowed",
  });

const loginSchema = joi
  .object({
    email: joi.string().trim().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

    password: joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  })
  .options({
    allowUnknown: false,
  })
  .messages({
    "object.unknown": "You entered a field that is not allowed",
  });

export const validateSignup = validatorMiddleware({
  body: signupSchema,
});

export const validateLogin = validatorMiddleware({
  body: loginSchema,
});
