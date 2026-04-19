import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../modules/auth/user.model";
import ApiError from "../utils/apiError";

interface DecodedToken {
  userId: string;
  iat: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new ApiError("يرجى تسجيل الدخول أولاً للوصول إلى هذه الخدمة", 401)
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as DecodedToken;

      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        return next(
          new ApiError("المستخدم صاحب هذا التوكن لم يعد موجوداً", 401)
        );
      }

      if (!currentUser.isActive) {
        return next(new ApiError("هذا الحساب غير نشط حالياً", 401));
      }

      if (currentUser.passwordChangedAt) {
        const changedTimestamp = Math.floor(
          currentUser.passwordChangedAt.getTime() / 1000
        );

        if (decoded.iat < changedTimestamp) {
          return next(
            new ApiError(
              "تم تغيير كلمة المرور مؤخراً، يرجى تسجيل الدخول مجدداً",
              401
            )
          );
        }
      }

      req.user = currentUser;
      next();
    } catch (err) {
      return next(new ApiError("التوكن غير صالح أو انتهت صلاحيته", 401));
    }
  }
);

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError("ليس لديك الصلاحية للقيام بهذا الإجراء", 403)
      );
    }
    next();
  };
};
