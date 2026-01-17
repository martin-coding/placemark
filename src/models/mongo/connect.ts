import * as dotenv from "dotenv";
import Mongoose from "mongoose";
// @ts-ignore
import * as mongooseSeeder from "mais-mongoose-seeder";
import { seedData } from "./seed-data.js";
import { Db } from "../../types/placemark-types.js";
import { userMongoStore } from "./user-mongo-store.js";
import { authMongoStore } from "./auth-mongo-store.js";
import { locationMongoStore } from "./location-mongo-store.js";
import { reviewMongoStore } from "./review-mongo-store.js";

const seedLib = mongooseSeeder.default;

async function seed() {
  const seeder = seedLib(Mongoose);
  const dbData = await seeder.seed(seedData, { dropDatabase: false, dropCollections: true });
  console.log(dbData);
}

export function connectMongo(db: Db) {
  dotenv.config();

  // Check if already connected to avoid redundant connections
  if (Mongoose.connection.readyState === 1) {
    console.log("Already connected to the database.");
    return;
  }

  Mongoose.set("strictQuery", true);
  // @ts-ignore
  Mongoose.connect(process.env.DB);
  const mongoDb = Mongoose.connection;

  db.userStore = userMongoStore;
  db.authStore = authMongoStore;
  db.locationStore = locationMongoStore;
  db.reviewStore = reviewMongoStore;

  mongoDb.on("error", (err) => {
    console.log(`database connection error: ${err}`);
  });

  mongoDb.on("disconnected", () => {
    console.log("database disconnected");
  });

  mongoDb.once("open", function () {
    console.log(`database connected to ${mongoDb.name} on ${mongoDb.host}`);
  });
}
