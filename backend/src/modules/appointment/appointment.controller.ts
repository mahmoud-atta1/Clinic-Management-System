import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Appointment from "./appointment.model";
import Doctor from "../doctor/doctor.model";
import ApiError from "../../utils/apiError";

export const bookAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { doctorId, date, slotTime, notes, appointmentType } = req.body;
    let patientId = req.body.patientId;

    if (req.user.role === "patient") {
      patientId = req.user._id;
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new ApiError("الطبيب غير موجود", 404));
    }

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const dayName = appointmentDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!doctor.availableDays.includes(dayName)) {
      return next(new ApiError(`عذراً، الطبيب غير متاح في هذا اليوم (${dayName})`, 400));
    }

    if (appointmentType === "follow_up") {
      const pastConsultation = await Appointment.findOne({
        patientId,
        doctorId,
        appointmentType: "consultation",
        status: "completed",
      });

      if (!pastConsultation) {
        return next(
          new ApiError(
            "عذراً، لا يمكنك حجز 'إعادة كشف' إلا بعد إتمام 'كشف جديد' مع هذا الطبيب أولاً",
            400
          )
        );
      }
    }

    const price =
      appointmentType === "follow_up"
        ? doctor.followUpFee
        : doctor.consultationFee;

    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      slotTime,
      status: { $nin: ["cancelled", "rejected"] },
    });

    if (existing) {
      return next(new ApiError("هذا الموعد محجوز بالفعل", 400));
    }

    const bookingCode = `APT-${Date.now()}`;
    const lastQueue = await Appointment.findOne({ doctorId, date }).sort({
      queueNumber: -1,
    });
    const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

    try {
      const appointment = await Appointment.create({
        patientId,
        doctorId,
        bookingCode,
        date,
        slotTime,
        queueNumber,
        appointmentType: appointmentType || "consultation",
        price,
        notes,
      });

      res.status(201).json({ success: true, data: appointment });
    } catch (error: any) {
      if (error.code === 11000) {
        return next(
          new ApiError("عذراً، هذا الموعد تم حجزه للتو من قبل شخص آخر", 400)
        );
      }
      next(error);
    }
  }
);

export const getAppointments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let filter: any = {};

    if (req.user.role === "patient") {
      filter.patientId = req.user._id;
    } else if (req.user.role === "doctor") {
      const doctorDoc = await Doctor.findOne({ userId: req.user._id });
      if (doctorDoc) {
        filter.doctorId = doctorDoc._id;
      } else {
        return next(new ApiError("Doctor record not found", 404));
      }
    } else if (req.user.role === "admin" || req.user.role === "receptionist") {
      filter = {};
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "fullName email phone")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "fullName" },
      })
      .sort({ date: -1, slotTime: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  }
);

export const checkInPatient = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "checked_in" },
      { new: true }
    );
    if (!appointment) return next(new ApiError("Appointment not found", 404));
    res.status(200).json({ success: true, data: appointment });
  }
);

export const updateAppointmentStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, paymentStatus, paymentMethod } = req.body;
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!appointment) return next(new ApiError("Appointment not found", 404));

    res.status(200).json({ success: true, data: appointment });
  }
);

export const completeAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "completed", notes: req.body.notes },
      { new: true }
    );
    if (!appointment) return next(new ApiError("Appointment not found", 404));
    res.status(200).json({ success: true, data: appointment });
  }
);

export const cancelAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return next(new ApiError("Appointment not found", 404));

    if (req.user.role === "patient") {
      if (appointment.patientId.toString() !== req.user._id.toString()) {
        return next(new ApiError("Not authorized", 403));
      }

      const appointmentTime = new Date(appointment.date);
      const timeParts = (appointment.slotTime || "").replace(/ (AM|PM)/, "").split(":");
      const hour = Number(timeParts[0] || 0);
      const min = Number(timeParts[1] || 0);
      const isPM = (appointment.slotTime || "").includes("PM");
      
      let finalHour = hour;
      if (isPM && hour !== 12) finalHour += 12;
      if (!isPM && hour === 12) finalHour = 0;
      
      appointmentTime.setHours(finalHour, min, 0, 0);

      const now = new Date();
      if ((appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60) < 5) {
        return next(new ApiError("عذراً، لا يمكن إلغاء الموعد قبل أقل من 5 ساعات من موعد الكشف", 400));
      }
    }

    appointment.status = "cancelled";
    await appointment.save();
    res.status(200).json({ success: true, data: appointment });
  }
);

export const getQueue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const date = new Date(req.params["date"] as string);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const appointments = await Appointment.find({
    doctorId: req.params["doctorId"],
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["pending", "confirmed", "checked_in"] },
  } as any).sort({ queueNumber: 1 });
  res.status(200).json({ success: true, data: appointments });
});

export const getAvailableSlots = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { doctorId, date } = req.query;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new ApiError("Doctor not found", 404));

    const slots: string[] = [];
    console.log(`Generating slots for doctor: ${doctorId}, date: ${date}`);
    console.log(`Doctor hours: ${doctor.startTime} to ${doctor.endTime}`);

    const parseTime = (timeStr: string) => {
      const isPM = timeStr.toLowerCase().includes("pm");
      const isAM = timeStr.toLowerCase().includes("am");
      const cleanTime = timeStr.replace(/ (AM|PM|am|pm)/, "");
      const [h, m] = cleanTime.split(":").map(Number);
      
      let finalH = h;
      if (isPM && h !== 12) finalH += 12;
      if (isAM && h === 12) finalH = 0;
      if (!isAM && !isPM && h < 24) finalH = h;
      
      return { h: finalH, m: m || 0 };
    };

    const start = parseTime(doctor.startTime || "00:00");
    const end = parseTime(doctor.endTime || "23:59");

    let curr = new Date(2024, 0, 1, start.h, start.m);
    const endDateTime = new Date(2024, 0, 1, end.h, end.m);

    const today = new Date();
    const selectedDate = new Date(date as string);
    const isSelectedToday = selectedDate.toDateString() === today.toDateString();

    while (curr < endDateTime) {
      const slotTimeStr = curr.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      
      let isValidSlot = true;
      if (isValidSlot) {
        slots.push(slotTimeStr);
      }
      
      curr.setMinutes(curr.getMinutes() + doctor.slotDuration);
    }

    console.log(`Total slots generated: ${slots.length}`);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const booked = await Appointment.find({ 
        doctorId: doctorId as any, 
        date: { $gte: startOfDay, $lte: endOfDay }, 
        status: { $nin: ["cancelled", "rejected"] } 
    } as any).select("slotTime");
    const bookedSlots = booked.map(b => b.slotTime);
    const availableSlots = slots.filter(s => !bookedSlots.includes(s));
    
    console.log(`Available after filtering booked: ${availableSlots.length}`);
    res.status(200).json({ success: true, data: availableSlots });
});
