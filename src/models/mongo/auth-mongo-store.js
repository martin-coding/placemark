import Mongoose from "mongoose";
import bcrypt from "bcrypt";
import { AuthIdentity } from "./auth.js";

export const authMongoStore = {
  async getAuthById(id) {
    if (Mongoose.isValidObjectId(id)) {
      const auth = await AuthIdentity.findOne({ _id: id }).lean();
      return auth;
    }
    return null;
  },

  async getLocalIdentity(email) {
    const identity = await AuthIdentity.findOne({
      provider: "local",
      email,
    }).populate("user");
    return identity;
  },

  async getOAuthIdentity(provider, identifier) {
    const identity = await AuthIdentity.findOne({
      provider: provider,
      providerUserId: identifier,
    }).populate("user");
    return identity;
  },

  async addLocalAuth(auth) {
    const saltRounds = 10;
    auth.passwordHash = await bcrypt.hash(auth.password, saltRounds);
    auth.provider = "local";

    const newAuth = new AuthIdentity(auth);
    const authObj = await newAuth.save();
    const a = await this.getAuthById(authObj._id);
    return a;
  },
  async addOAuth(auth) {
    await AuthIdentity.create(auth);
  },
};
