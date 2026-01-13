import Mongoose from "mongoose";
import { User } from "./user.js";
import { AuthIdentity } from "./auth.js";
import { Location } from "./location.js";

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find().lean();
    return users;
  },

  async getUserById(id) {
    if (Mongoose.isValidObjectId(id)) {
      const user = await User.findOne({ _id: id }).lean();
      return user;
    }
    return null;
  },

  async addUser(user) {
    const newUser = new User(user);
    const userObj = await newUser.save();
    const u = await this.getUserById(userObj._id);
    return u;
  },

  async getUserByEmail(email) {
    const user = await User.findOne({ email: email }).lean();
    return user;
  },

  async deleteUserById(id) {
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
