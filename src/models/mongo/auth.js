import mongoose from "mongoose";

const { Schema } = mongoose;

const authIdentitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      enum: ["local", "github", "google"],
      required: true,
    },

    providerUserId: {
      type: String,
      required: true,
    },

    passwordHash: {
      type: String,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

authIdentitySchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

export const AuthIdentity = mongoose.model("AuthIdentity", authIdentitySchema);
