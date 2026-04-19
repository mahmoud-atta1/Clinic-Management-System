import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Specialization from "./specialization.model";
import ApiError from "../../utils/apiError";
import ApiFeatures from "../../utils/apiFeatures";

export const createSpecialization = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const specialization = await Specialization.create(req.body);
    res.status(201).json({ success: true, data: specialization });
  }
);

export const getSpecializations = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const countDocuments = await Specialization.countDocuments();
    const apiFeatures = new ApiFeatures(Specialization.find(), req.query)
      .paginate(countDocuments)
      .filter()
      .search()
      .limitFields()
      .sort();

    const { mongooseQuery, paginationResult } = apiFeatures;
    const specializations = await mongooseQuery;

    res.status(200).json({ 
      success: true, 
      paginationResult,
      data: specializations 
    });
  }
);

export const updateSpecialization = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const specialization = await Specialization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!specialization) {
      return next(new ApiError(`لا يوجد تخصص بهذا المعرف ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: specialization });
  }
);

export const deleteSpecialization = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const specialization = await Specialization.findByIdAndDelete(req.params.id);

    if (!specialization) {
      return next(new ApiError(`لا يوجد تخصص بهذا المعرف ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: null });
  }
);
