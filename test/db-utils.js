import mongoose from "mongoose";

let isConnected = false;

export async function resetDatabase() {
  if (!isConnected) {
    await mongoose.connect(process.env.DB);
    isConnected = true;
  }

  await mongoose.connection.dropDatabase();
}
