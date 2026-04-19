import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  bookingCode: string;
  date: Date;
  slotTime: string;
  queueNumber: number;
  appointmentType: "consultation" | "follow_up";
  price: number;
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "rejected";
  paymentStatus: "paid" | "unpaid";
  paymentMethod?: "cash" | "online";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema: Schema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slotTime: {
      type: String,
      required: true,
    },
    queueNumber: {
      type: Number,
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ["consultation", "follow_up"],
      default: "consultation",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index(
  { doctorId: 1, date: 1, slotTime: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ["cancelled", "rejected"] } } }
);

export default mongoose.model<IAppointment>("Appointment", appointmentSchema);
