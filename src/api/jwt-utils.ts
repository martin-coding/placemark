// @ts-ignore
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../models/db.js";

const result = dotenv.config();

// @ts-ignore
export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  return jwt.sign(payload, process.env.COOKIE_PASSWORD, options);
}

// @ts-ignore
export function decodeToken(token) {
  const userInfo = {};
  try {
    const decoded = jwt.verify(token, process.env.COOKIE_PASSWORD);
    // @ts-ignore
    userInfo.userId = decoded.id;
    // @ts-ignore
    userInfo.email = decoded.email;
  } catch (e) {
    // @ts-ignore
    console.log(e.message);
  }
  return userInfo;
}

// @ts-ignore
export async function validate(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}
