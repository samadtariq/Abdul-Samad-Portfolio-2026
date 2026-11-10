import { rateLimit } from "express-rate-limit";
export function createRateLimits() {
  return {
    login: rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 15,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    contact: rateLimit({
      windowMs: 3600000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  };
}
