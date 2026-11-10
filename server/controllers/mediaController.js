import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { models } from "../models/index.js";
import { error, validId, usages } from "../utils/validation.js";
export function createMediaController({ storage }) {
  async function uploadMedia(req, res) {
    if (!req.file) throw error("Choose a file.");
    const type = await fileTypeFromBuffer(req.file.buffer);
    const allowed = {
      "image/jpeg": "image",
      "image/png": "image",
      "image/webp": "image",
      "image/gif": "image",
      "video/mp4": "video",
      "video/webm": "video",
      "application/pdf": "document",
    };
    if (!type || !allowed[type.mime])
      throw error("Supported files: JPG, PNG, WebP, GIF, MP4, WebM and PDF.");
    const key = await storage.put(req.file.buffer, type.ext);
    try {
      const doc = await models.media.create({
        kind: allowed[type.mime],
        storageProvider: "local",
        storageKey: key,
        originalName: path.basename(req.file.originalname).slice(0, 255),
        mimeType: type.mime,
        sizeBytes: req.file.size,
        uploadedBy: req.admin._id,
        alt: "",
        caption: "",
      });
      res.status(201).json(doc);
    } catch (e) {
      await storage.remove(key).catch(() => {});
      throw e;
    }
  }

  async function serveMedia(req, res, next) {
    if (!validId(req.params.id)) throw error("Not found", 404);
    const doc = await models.media.findById(req.params.id).lean();
    if (!doc) throw error("Not found", 404);
    if (
      !req.admin &&
      !(await usages(req.params.id, { publicOnly: true })).length
    )
      throw error("Not found", 404);
    if (
      doc.storageProvider !== "local" ||
      !/^[-\w]+\.[a-z0-9]+$/i.test(doc.storageKey)
    )
      throw error("Storage unavailable", 503);
    res.set("Cache-Control", "private, no-store").type(doc.mimeType);
    if (doc.kind === "document")
      res.set("Content-Disposition", 'attachment; filename="document.pdf"');
    res.sendFile(storage.filePath(doc.storageKey), (err) => {
      if (err)
        next(error("Media file unavailable.", err.status === 404 ? 404 : 500));
    });
  }
  return { uploadMedia, serveMedia };
}
