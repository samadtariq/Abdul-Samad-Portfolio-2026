import mongoose from "mongoose";
export async function connectDatabase() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB)
    throw new Error("Configure server/.env using .env.example.");
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB,
    serverSelectionTimeoutMS: 5000,
  });
  if (
    !(await mongoose.connection.db
      .collection("_schema_migrations")
      .findOne({ _id: "002_application" }))
  ) {
    await mongoose.disconnect();
    throw new Error(
      "Database is not initialized. Run npm run db:migrate explicitly.",
    );
  }
  return mongoose.connection;
}
