import mongoose from "mongoose";
import "server-only";

const globalForMongo = globalThis as unknown as {
  mongoosePromise?: Promise<typeof mongoose>;
};

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI is required for authentication. Set it in .env (see .env.target.example).",
    );
  }
  return uri;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (!globalForMongo.mongoosePromise) {
    globalForMongo.mongoosePromise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });
  }
  return globalForMongo.mongoosePromise;
}
