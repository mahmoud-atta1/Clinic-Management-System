import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import asyncHandler from "express-async-handler";

import User from "./user.model";
import ApiError from "../../utils/apiError";
import sendEmail from "../../utils/sendEmail";

const createToken = (id: string): string => {
  return jwt.sign({ userId: id }, process.env["JWT_SECRET"] as string, {
    expiresIn: (process.env["JWT_EXPIRE_TIME"] || "7d") as any,
  });
};

const sendTokenCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      if (userExists.email === email) {
        return next(new ApiError("البريد الإلكتروني مستخدم بالفعل", 400));
      }
      if (userExists.phone === phone) {
        return next(new ApiError("رقم الهاتف مستخدم بالفعل", 400));
      }
    }

    const user = await User.create(req.body);

    const token = createToken(user._id.toString());
    sendTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      token,
      data: user,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone, password } = req.body;

    const user = await User.findOne({ $or: [{ email }, { phone }] }).select(
      "+password"
    );

    if (!user || !(await bcryptjs.compare(password, user.password as string))) {
      return next(new ApiError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401));
    }

    const token = createToken(user._id.toString());
    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token,
      data: user,
    });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ApiError("لا يوجد مستخدم بهذا البريد الإلكتروني", 404));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetVerified = false;

    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const message = `يرجى الانتقال إلى هذا الرابط لاستعادة كلمة المرور: \n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "رابط استعادة كلمة المرور الخاص بك",
        message,
      });

      res.status(200).json({
        success: true,
        message: "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني",
      });
    } catch (err) {
      (user as any).passwordResetToken = undefined;
      (user as any).passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ApiError("حدث خطأ في إرسال البريد الإلكتروني، حاول لاحقاً", 500));
    }
  }
);

export const verifyResetToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params["token"] as string;
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("الرابط غير صحيح أو انتهت صلاحيته", 400));
    }

    user.passwordResetVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "تم التحقق من الرابط بنجاح",
      email: user.email
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ApiError("لا يوجد مستخدم بهذا البريد الإلكتروني", 404));
    }

    if (!user.passwordResetVerified) {
      return next(new ApiError("يجب التحقق من رابط استعادة كلمة المرور أولاً", 400));
    }

    user.password = req.body.newPassword;
    (user as any).passwordResetToken = undefined;
    (user as any).passwordResetExpires = undefined;
    (user as any).passwordResetVerified = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    const token = createToken(user._id.toString());
    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
      token,
    });
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  }
);
