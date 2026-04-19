import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Doctor from "./doctor.model";
import Appointment from "../appointment/appointment.model";
import ApiError from "../../utils/apiError";
import ApiFeatures from "../../utils/apiFeatures";

export const getDoctorStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return next(new ApiError("لم يتم العثور على سجل الطبيب", 404));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalPatients = await Appointment.distinct("patientId", {
      doctorId: doctor._id,
    });

    const todayAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      date: today,
      status: { $ne: "cancelled" },
    });

    const pendingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      data: {
        totalPatients: totalPatients.length,
        todayAppointments,
        pendingAppointments,
      },
    });
  }
);

export const addDoctor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const existingDoctor = await Doctor.findOne({ userId: req.body.userId });
    if (existingDoctor) {
      return next(new ApiError("هذا المستخدم مسجل بالفعل كطبيب", 400));
    }

    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  }
);

export const getDoctors = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const countDocuments = await Doctor.countDocuments();
    const apiFeatures = new ApiFeatures(Doctor.find(), req.query)
      .paginate(countDocuments)
      .filter()
      .search()
      .limitFields()
      .sort();

    const { mongooseQuery, paginationResult } = apiFeatures;
    const doctors = await mongooseQuery
      .populate("userId", "fullName email phone")
      .populate("specializationId", "name");
      
    res.status(200).json({ 
      success: true, 
      paginationResult,
      data: doctors 
    });
  }
);

export const getDoctor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await Doctor.findById(req.params.id)
      .populate("userId", "fullName email phone")
      .populate("specializationId", "name");

    if (!doctor) {
      return next(new ApiError(`لا يوجد طبيب بهذا المعرف ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: doctor });
  }
);

export const updateDoctor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return next(new ApiError(`لا يوجد طبيب بهذا المعرف ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: doctor });
  }
);

export const deleteDoctor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return next(new ApiError(`لا يوجد طبيب بهذا المعرف ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: {} });
  }
);
