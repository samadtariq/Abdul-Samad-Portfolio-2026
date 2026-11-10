import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "node:path";
import { clientDist, uploadDirectory } from "./config/paths.js";
import { createStorage } from "./services/storageService.js";
import { session, requireAuth } from "./middleware/authMiddleware.js";
import { createCsrfMiddleware } from "./middleware/csrfMiddleware.js";
import {
  securityHeaders,
  privatePageHeaders,
} from "./middleware/securityMiddleware.js";
import { createRateLimits } from "./middleware/rateLimitMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createAdminRouter } from "./routes/adminRoutes.js";
import { createMediaRouters } from "./routes/mediaRoutes.js";
import { createContactRouter } from "./routes/contactRoutes.js";
import { createPublicRouter } from "./routes/publicRoutes.js";
export function createApp({
  siteUrl = process.env.SITE_URL || "http://localhost:3000",
  uploadDir = uploadDirectory(),
} = {}) {
  const app = express(),
    origin = new URL(siteUrl).origin,
    production = process.env.NODE_ENV === "production",
    storage = createStorage(uploadDir);
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    securityHeaders(production),
    privatePageHeaders,
    cookieParser(),
    express.json({ limit: "2mb" }),
  );
  const security = createCsrfMiddleware(origin),
    limits = createRateLimits(),
    context = {
      production,
      origin,
      storage,
      session,
      requireAuth,
      limits,
      ...security,
    };
  app.use("/api", session);
  app.use("/api/auth", createAuthRouter(context));
  app.use("/api/admin", createAdminRouter(context));
  const { uploadRouter, fileRouter } = createMediaRouters(context);
  app.use("/api/media", uploadRouter);
  app.use("/media", fileRouter);
  app.use("/api/contact", createContactRouter(context));
  app.get("/api/health", (req, res) =>
    res.json({ ok: mongoose.connection.readyState === 1 }),
  );
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "Endpoint not found" }),
  );
  app.use(
    "/assets",
    express.static(path.join(clientDist, "assets"), { maxAge: "1d" }),
  );
  app.use("/dist", express.static(clientDist, { maxAge: 0 }));
  app.use(createPublicRouter(context));
  app.use(errorHandler);
  return app;
}
