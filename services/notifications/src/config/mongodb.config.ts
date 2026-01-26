import mongoose from "mongoose";
import { config } from "./env.config";

export class MongoDB {
  static async connect(): Promise<void> {
    try {
      await mongoose.connect(config.mongodbUri);
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }
}

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});
