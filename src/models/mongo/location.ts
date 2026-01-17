import Mongoose from "mongoose";
import { ILocation } from "../../types/placemark-types.js";

const { Schema } = Mongoose;

const locationSchema = new Schema<ILocation>({
  title: String,
  latitude: Number,
  longitude: Number,
  description: String,
  category: String,
  img: String,
  visibility: String,
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Location = Mongoose.model("Location", locationSchema);
