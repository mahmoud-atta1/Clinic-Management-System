import express from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getProfile,
} from "./auth.controller";
import { validateSignup, validateLogin } from "./auth.vaildator";
import { protect } from "../../middlewares/authMiddleware";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetToken/:token", verifyResetToken);
router.put("/resetPassword", resetPassword);

router.get("/profile", protect, getProfile);

export default router;
