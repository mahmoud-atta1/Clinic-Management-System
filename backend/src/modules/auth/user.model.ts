import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "doctor", "receptionist", "patient"],
      default: "patient",
    },

    gender: {
      type: String,
      enum: ["male", "female"],
    },

    dateOfBirth: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcryptjs.hash(this.password, 12);
});

export default mongoose.model("User", userSchema);
