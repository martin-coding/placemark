import Mongoose from "mongoose";
import { Review } from "./review.js";
import { IReview } from "../../types/placemark-types.js";

export const reviewMongoStore = {
  async getReviewById(id: string) {
    if (Mongoose.isValidObjectId(id)) {
      const review = await Review.findOne({ _id: id }).lean();
      return review;
    }
    return null;
  },

  async getReviewsFromLocation(locationId: string) {
    const reviews = await Review.find({ locationid: locationId })
      .populate({
        path: "userid",
        select: "firstName lastName",
      })
      .lean();
    return reviews;
  },

  async addReview(review: IReview) {
    await Review.create(review);
  },

  async deleteReviewById(id: string) {
    try {
      await Review.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async getUserReviewForLocation(locationId: string, userId: string) {
    return Review.findOne({
      locationid: locationId,
      userid: userId,
    }).lean();
  },

  async upsertReview(locationId: string, userId: string, rating: number, comment: string) {
    await Review.findOneAndUpdate({ locationid: locationId, userid: userId }, { rating, comment }, { upsert: true, new: true });
  },
};
