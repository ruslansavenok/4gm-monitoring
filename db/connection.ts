import mongoose from "mongoose";
import { MONGO_DB_URL } from "../shared/config";

// Fix HMR issues in next.js
if (process.env.NODE_ENV === "development") {
  Object.keys(mongoose.models).forEach((modelName) => {
    delete mongoose.models[modelName];
  });
}

export async function setupMongoConnection() {
  await mongoose.connect(MONGO_DB_URL);
}
