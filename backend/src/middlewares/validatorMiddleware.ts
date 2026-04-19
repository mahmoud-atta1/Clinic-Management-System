import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";

interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
}

const validatorMiddleware = (schema: ValidationSchema) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const options = {
      abortEarly: false,
    };

    try {
      if (schema.body) {
        req.body = await schema.body.validateAsync(req.body, options);
      }

      if (schema.params) {
        req.params = await schema.params.validateAsync(req.params, options);
      }

      if (schema.query) {
        req.query = await schema.query.validateAsync(req.query, options);
      }

      next();
    } catch (error: any) {
      const errorMessages = error.details
        .map((detail: any) => detail.message)
        .join(", ");

      return next(new ApiError(errorMessages, 400));
    }
  });

export default validatorMiddleware;
