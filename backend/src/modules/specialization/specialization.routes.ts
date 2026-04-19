import express from "express";
import {
  createSpecialization,
  getSpecializations,
  updateSpecialization,
  deleteSpecialization,
} from "./specialization.controller";
import {
  validateCreateSpecialization,
  validateUpdateSpecialization,
} from "./specialization.validator";
import { protect, authorize } from "../../middlewares/authMiddleware";

const router = express.Router();

router
  .route("/")
  .get(getSpecializations)
  .post(protect, authorize("admin"), validateCreateSpecialization, createSpecialization);

router
  .route("/:id")
  .put(protect, authorize("admin"), validateUpdateSpecialization, updateSpecialization)
  .delete(protect, authorize("admin"), deleteSpecialization);

export default router;
