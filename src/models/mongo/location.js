import Mongoose from "mongoose";

const { Schema } = Mongoose;

const locationSchema = new Schema({
  title: String,
  latitude: Number,
  longitude: Number,
  description: String,
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Location = Mongoose.model("Location", locationSchema);
