import Mongoose from "mongoose";
import { User } from "./user.js";
import { IUser } from "../../types/placemark-types.js";
import { AuthIdentity } from "./auth.js";
import { Location } from "./location.js";

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find().lean();
    return users;
  },

  async getUserById(id: string) {
    if (Mongoose.isValidObjectId(id)) {
      const user = await User.findOne({ _id: id }).lean();
      return user;
    }
    return null;
  },

  async addUser(user: IUser) {
    const newUser = new User(user) as any;
    const userObj = await newUser.save();
    const u = await this.getUserById(userObj._id);
    return u;
  },

  async getUserByEmail(email: string) {
    const user = await User.findOne({ email: email }).lean();
    return user;
  },

  async deleteUserById(id: string) {
    try {
      await Location.deleteMany({
        visibility: "private",
        userid: id,
      });
      await AuthIdentity.deleteMany({ user: id });
      await User.findByIdAndDelete(id);
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll() {
    await AuthIdentity.deleteMany({});
    await User.deleteMany({});
  },
};
