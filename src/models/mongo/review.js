import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    locationid: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: Number,
    comment: String,
  },
  { timestamps: true }
);

reviewSchema.index({ locationid: 1, userid: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
