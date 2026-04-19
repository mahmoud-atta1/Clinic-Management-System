import mongoose, { Schema, Document } from "mongoose";

export interface ISpecialization extends Document {
  name: string;
  description?: string;
}

const specializationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISpecialization>("Specialization", specializationSchema);
