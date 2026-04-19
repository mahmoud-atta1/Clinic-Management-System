import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import User from "../auth/user.model";
import ApiFeatures from "../../utils/apiFeatures";
import ApiError from "../../utils/apiError";

export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const countDocuments = await User.countDocuments();

    const apiFeatures = new ApiFeatures(User.find(), req.query)
      .paginate(countDocuments)
      .filter()
      .search()
      .limitFields()
      .sort();

    const { mongooseQuery, paginationResult } = apiFeatures;
    const users = await mongooseQuery;

    res.status(200).json({
      success: true,
      paginationResult,
      data: users,
    });
  }
);

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ApiError(`No user found for this id ${req.params.id}`, 404));
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new ApiError(`No user found for this id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ApiError(`No user found for this id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: null,
    });
  }
);
