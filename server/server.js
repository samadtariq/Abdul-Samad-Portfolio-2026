import mongoose from "mongoose";
import { connectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
await connectDatabase();
console.log("MongoDB connected successfully");
const app = createApp();
const server = app.listen(process.env.PORT || 3000, "0.0.0.0", () =>
  console.log(`Local: ${process.env.SITE_URL || "http://localhost:3000"}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
