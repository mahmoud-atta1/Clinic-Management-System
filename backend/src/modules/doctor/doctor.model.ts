import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  specializationId: mongoose.Types.ObjectId;
  consultationFee: number;
  followUpFee: number;
  availableDays: string[];
  startTime: string;
  endTime: string;  
  slotDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specializationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 300,
    },
    followUpFee: {
      type: Number,
      required: true,
      default: 150,
    },
    availableDays: {
      type: [String],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    slotDuration: {
      type: Number,
      required: true,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDoctor>("Doctor", doctorSchema);
