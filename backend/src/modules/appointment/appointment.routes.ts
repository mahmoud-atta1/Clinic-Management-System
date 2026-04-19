import express from "express";
import {
  bookAppointment,
  getAppointments,
  checkInPatient,
  completeAppointment,
  cancelAppointment,
  getQueue,
  getAvailableSlots,
  updateAppointmentStatus,
} from "./appointment.controller";
import { validateBookAppointment } from "./appointment.validator";
import { protect, authorize } from "../../middlewares/authMiddleware";

const router = express.Router();

router
  .route("/")
  .get(protect, getAppointments)
  .post(protect, authorize("patient", "receptionist"), validateBookAppointment, bookAppointment);

router.get("/available-slots", getAvailableSlots);
router.get("/queue/:doctorId/:date", getQueue);

router.patch("/:id/check-in", protect, authorize("receptionist", "admin"), checkInPatient);
router.patch("/:id/status", protect, authorize("receptionist", "admin"), updateAppointmentStatus);
router.patch("/:id/complete", protect, authorize("doctor", "admin"), completeAppointment);
router.patch("/:id/cancel", protect, authorize("patient", "receptionist", "admin"), cancelAppointment);

export default router;
