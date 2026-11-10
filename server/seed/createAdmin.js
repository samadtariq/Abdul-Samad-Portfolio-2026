import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Admin } from "../models/index.js";
const {
  MONGODB_URI,
  MONGODB_DB,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME = "Abdul Samad",
} = process.env;
if (!MONGODB_URI || !MONGODB_DB || !ADMIN_EMAIL || !ADMIN_PASSWORD)
  throw new Error(
    "Set database environment plus ADMIN_EMAIL and ADMIN_PASSWORD.",
  );
if (ADMIN_PASSWORD.length < 12 || Buffer.byteLength(ADMIN_PASSWORD) > 72)
  throw new Error("Password: 12+ characters, maximum 72 UTF-8 bytes.");
const email = ADMIN_EMAIL.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
try {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  if (
    !(await mongoose.connection.db
      .collection("_schema_migrations")
      .findOne({ _id: "002_application" }))
  )
    throw new Error("Run db:migrate first.");
  await Admin.create({
    name: ADMIN_NAME,
    email,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    active: true,
  });
  console.log("Admin created.");
} finally {
  await mongoose.disconnect();
}
