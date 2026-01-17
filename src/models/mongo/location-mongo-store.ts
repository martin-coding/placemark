import Mongoose from "mongoose";
import { Types } from "mongoose";
import { Location } from "./location.js";
import { Review } from "./review.js";
import { ILocation, UpdateLocationDTO } from "../../types/placemark-types.js";

export const locationMongoStore = {
  async getAllLocations() {
    const locations = await Location.find().lean();
    return locations;
  },

  async getLocationById(id: Types.ObjectId) {
    if (Mongoose.isValidObjectId(id)) {
      const location = await Location.findOne({ _id: id }).lean();
      return location;
    }
    return null;
  },

  async addLocation(location: ILocation) {
    const newLocation = new Location(location);
    const locationObj = await newLocation.save();
    return this.getLocationById(locationObj._id);
  },

  async getUserLocations(id: string, category: string) {
    const query = {
      $or: [{ userid: id }, { visibility: "public" }],
    };

    if (category) {
      // @ts-ignore
      query.category = category;
    }

    const locations = await Location.find(query).lean();
    return locations;
  },

  async deleteLocationById(id: string) {
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

  async editLocation({ _id, ...updateData }: UpdateLocationDTO) {
    const updated = await Location.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) throw new Error("Location not found");

    return updated;
  },

  async updateLocation(updatedLocation: ILocation) {
    const location = await Location.findOne({ _id: updatedLocation._id });

    if (!location) throw new Error("Location not found");

    location.img = updatedLocation.img;
    await location.save();
  },
};
