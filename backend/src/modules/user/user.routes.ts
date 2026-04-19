import express from "express";
import {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "./user.controller";
import { protect, authorize } from "../../middlewares/authMiddleware";

const router = express.Router();

router.use(protect, authorize("admin"));

router.route("/").get(getAllUsers).post(createUser);

router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
