import { Express } from "express";
import authRoutes from "./modules/auth/auth.routes";
import doctorRoutes from "./modules/doctor/doctor.routes";
import specializationRoutes from "./modules/specialization/specialization.routes";
import appointmentRoutes from "./modules/appointment/appointment.routes";
import userRoutes from "./modules/user/user.routes";

const mountRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/specializations", specializationRoutes);
  app.use("/api/appointments", appointmentRoutes);
};

export default mountRoutes;