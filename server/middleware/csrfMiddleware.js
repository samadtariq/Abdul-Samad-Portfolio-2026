import { timingSafeEqual } from "node:crypto";
import { hash } from "../utils/crypto.js";
import { error } from "../utils/validation.js";
export function createCsrfMiddleware(origin) {
  const sameOrigin = (req, res, next) => {
    const sent = req.get("Origin");
    if (!sent || sent !== origin)
      return next(error("Request origin rejected.", 403));
    next();
  };
  const csrf = (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    if (req.get("Origin") !== origin)
      return next(error("Request origin rejected.", 403));
    const expected = hash("csrf:" + req.rawToken),
      actual = req.get("X-CSRF-Token") || "";
    if (
      actual.length !== expected.length ||
      !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
    )
      return next(error("Invalid request token. Refresh and try again.", 403));
    next();
  };
  return { sameOrigin, csrf };
}
