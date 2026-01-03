import mongoose from "mongoose";
import { MONGO_DB_URL } from "../config";

export async function setupMongoConnection() {
  await mongoose.connect(MONGO_DB_URL);
}
