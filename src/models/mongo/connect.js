import * as dotenv from "dotenv";
import Mongoose from "mongoose";

export function connectMongo() {
  return new Promise((resolve, reject) => {
    dotenv.config();

    Mongoose.set("strictQuery", true);

    // Check if already connected
    if (Mongoose.connection.readyState === 1) {
      console.log("Database is already connected.");
      resolve();
      return;
    }

    Mongoose.connect(process.env.DB);
    const db = Mongoose.connection;

    db.on("error", (err) => {
      console.log(`database connection error: ${err}`);
      reject(err);
    });

    db.on("disconnected", () => {
      console.log("database disconnected");
    });

    db.once("open", function () {
      console.log(`database connected to ${this.name} on ${this.host}`);
      resolve();
    });
  });
}
