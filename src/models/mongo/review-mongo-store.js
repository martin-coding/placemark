import Mongoose from "mongoose";
import { Review } from "./review.js";

export const reviewMongoStore = {
  async getReviewById(id) {
    if (Mongoose.isValidObjectId(id)) {
      const review = await Review.findOne({ _id: id }).lean();
      return review;
    }
    return null;
  },

  async getReviewsFromLocation(locationId) {
    const reviews = await Review.find({ locationid: locationId })
      .populate({
        path: "userid",
        select: "firstName lastName",
      })
      .lean();
    return reviews;
  },

  async addReview(review) {
    await Review.create(review);
  },

  async deleteReviewById(id) {
    try {
      await Review.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async getUserReviewForLocation(locationId, userId) {
    return Review.findOne({
      locationid: locationId,
      userid: userId,
    }).lean();
  },

  async upsertReview(locationId, userId, rating, comment) {
    await Review.findOneAndUpdate({ locationid: locationId, userid: userId }, { rating, comment }, { upsert: true, new: true });
  },
};
