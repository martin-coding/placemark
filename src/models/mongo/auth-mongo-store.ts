import Mongoose from "mongoose";
// @ts-ignore
import bcrypt from "bcrypt";
import { AuthIdentity } from "./auth.js";
import { IAuthIdentity } from "../../types/placemark-types.js";

export const authMongoStore = {
  async getAuthById(id: string) {
    if (Mongoose.isValidObjectId(id)) {
      const auth = await AuthIdentity.findOne({ _id: id }).lean();
      return auth;
    }
    return null;
  },

  async getLocalIdentity(email: string) {
    const identity = await AuthIdentity.findOne({
      provider: "local",
      email,
    }).populate("user");
    return identity;
  },

  async getOAuthIdentity(provider: string, identifier: string) {
    const identity = await AuthIdentity.findOne({
      provider: provider,
      providerUserId: identifier,
    }).populate("user");
    return identity;
  },

  async addLocalAuth(auth: any) {
    const saltRounds = 10;
    auth.passwordHash = await bcrypt.hash(auth.password, saltRounds);
    auth.provider = "local";

    const newAuth = new AuthIdentity(auth);
    const authObj = (await newAuth.save()) as any;
    const a = await this.getAuthById(authObj._id);
    return a;
  },
  async addOAuth(auth: IAuthIdentity) {
    await AuthIdentity.create(auth);
  },
};
