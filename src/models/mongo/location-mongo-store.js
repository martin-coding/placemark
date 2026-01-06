import Mongoose from "mongoose";
import { Location } from "./location.js";

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
      $or: [
        { userid: id },
        { visibility: "public" }
      ]
    };

    if (category) {
      query.category = category;
    }

    const locations = await Location.find(query).lean();
    return locations;
  },

  async deleteLocationById(id) {
    try {
      await Location.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAllLocations() {
    await Location.deleteMany({});
  },

  async updateLocation(updatedLocation) {
    const location = await Location.findOne({ _id: updatedLocation._id });
    location.img = updatedLocation.img;
    await location.save();
  },
};
