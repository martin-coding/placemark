import { Db } from "../types/placemark-types.js";
import { connectMongo } from "./mongo/connect.js";

export const db: Db = {
  userStore: null,
  locationStore: null,
  authStore: null,
  reviewStore: null,
};

export function connectDb(dbType: string) {
  switch (dbType) {
    default:
      connectMongo(db);
      break;
  }
}
