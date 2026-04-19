import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import mountRoutes from "./routes";
import dbConnection from "./config/db";
import globalError from "./middlewares/errorMiddleware";
import ApiError from "./utils/apiError";

process.on("uncaughtException", (err: Error) => {
  console.error(`Uncaught Exception: ${err.name} | ${err.message}`);
  process.exit(1);
});

dotenv.config({ path: ".env" });

const app = express();

dbConnection();

app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(cookieParser());

mountRoutes(app);

app.all("*path", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

app.use(globalError);

const PORT: number = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err: unknown) => {
  if (err instanceof Error) {
    console.error(`Unhandled Rejection: ${err.name} | ${err.message}`);
  }

  server.close(() => {
    console.error("Shutting down...");
    process.exit(1);
  });
});
