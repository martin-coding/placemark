import Mongoose from "mongoose";
import { Location } from "./location.js";
import { Review } from "./review.js";

export const locationMongoStore = {
  async getAllLocations() {
    const locations = await Location.find().lean();
    return locations;
  },

  async getLocationById(id) {
    if (Mongoose.isValidObjectId(id)) {
      const location = await Location.findOne({ _id: id }).lean();
      return location;
    }
    return null;
  },

  async addLocation(location) {
    const newLocation = new Location(location);
    const locationObj = await newLocation.save();
    return this.getLocationById(locationObj._id);
  },

  async getUserLocations(id, category) {
    const query = {
      $or: [{ userid: id }, { visibility: "public" }],
    };

    if (category) {
      query.category = category;
    }

    const locations = await Location.find(query).lean();
    return locations;
  },

  async deleteLocationById(id) {
    try {
      await Review.deleteMany({ locationid: id });
      await Location.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAllLocations() {
    await Location.deleteMany({});
  },

  async editLocation(updatedLocation) {
    const { _id, title, category, visibility, latitude, longitude, description } = updatedLocation;

    if (!_id) throw new Error("Location _id is required");

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (description !== undefined) updateData.description = description;

    const updated = await Location.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });

    if (!updated) throw new Error("Location not found");

    return updated;
  },

  async updateLocation(updatedLocation) {
    const location = await Location.findOne({ _id: updatedLocation._id });
    location.img = updatedLocation.img;
    await location.save();
  },
};
