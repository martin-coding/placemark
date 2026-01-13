import Mongoose from "mongoose";
import { Review } from "./review.js";

export const reviewMongoStore = {
  async getReviewsFromLocation(location_id) {
    const reviews = await Review.find({ locationid: location_id })
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
  async getUserReviewForLocation(locationId, userId) {
    return await Review.findOne({
      locationid: locationId,
      userid: userId,
    }).lean();
  },
  async upsertReview(locationId, userId, rating, comment) {
    await Review.findOneAndUpdate({ locationid: locationId, userid: userId }, { rating, comment }, { upsert: true, new: true });
  },
};
