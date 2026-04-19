import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";

const handleJwtInvalidSig = () => new ApiError("التوكن غير صالح، يرجى تسجيل الدخول مجدداً", 401);
const handleJwtExpired = () => new ApiError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً", 401);

const globalError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSig();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message = field === "email" ? "البريد الإلكتروني موجود بالفعل" : 
                     field === "phone" ? "رقم الهاتف موجود بالفعل" : 
                     "هذا السجل موجود بالفعل أو تم حجزه للتو";
      err = new ApiError(message, 400);
    }
    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err: any, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err: any, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

export default globalError;
