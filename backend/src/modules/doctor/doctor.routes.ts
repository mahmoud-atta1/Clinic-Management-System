import express from "express";
import {
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorStats,
} from "./doctor.controller";
import { validateAddDoctor, validateUpdateDoctor } from "./doctor.validator";
import { protect, authorize } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/stats", protect, authorize("doctor"), getDoctorStats);

router
  .route("/")
  .get(getDoctors)
  .post(protect, authorize("admin"), validateAddDoctor, addDoctor);

router
  .route("/:id")
  .get(getDoctor)
  .put(protect, authorize("admin"), validateUpdateDoctor, updateDoctor)
  .delete(protect, authorize("admin"), deleteDoctor);

export default router;
