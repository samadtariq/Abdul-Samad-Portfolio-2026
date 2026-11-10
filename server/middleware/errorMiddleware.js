import multer from "multer";
import { escapeHtml } from "../utils/escapeHtml.js";
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status =
    err.status ||
    (err.code === 11000
      ? 409
      : err.name === "ValidationError" ||
          err.name === "StrictModeError" ||
          err.name === "CastError" ||
          err instanceof multer.MulterError
        ? 400
        : 500);
  const message =
    status === 500
      ? "Something went wrong. Please try again."
      : err.code === 11000
        ? "This email, slug or unique value is already in use."
        : err.message;
  if (status === 500) console.error(err.name, err.message);
  if (req.path.startsWith("/api"))
    res
      .status(status)
      .json({
        error: message,
        ...(status === 400 && err.fieldErrors
          ? { fieldErrors: err.fieldErrors }
          : {}),
      });
  else
    res
      .status(status)
      .type("html")
      .send(
        `<h1>${status}</h1><p>${escapeHtml(message)}</p><a href="/">Return home</a>`,
      );
}
