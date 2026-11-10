import { Router } from "express";
import { createMediaController } from "../controllers/mediaController.js";
import { createUploadMiddleware } from "../middleware/uploadMiddleware.js";
export function createMediaRouters({ storage, requireAuth, csrf, session }) {
  const uploadRouter = Router(),
    fileRouter = Router(),
    c = createMediaController({ storage }),
    upload = createUploadMiddleware();
  uploadRouter.post(
    "/upload",
    requireAuth,
    csrf,
    upload.single("file"),
    c.uploadMedia,
  );
  fileRouter.get("/:id", session, c.serveMedia);
  return { uploadRouter, fileRouter };
}
