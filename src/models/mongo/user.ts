import { Schema, model } from "mongoose";
import { IUser } from "../../types/placemark-types.js";

const userSchema = new Schema<IUser>(
  {
    firstName: String,
    lastName: String,

    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
