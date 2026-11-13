import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
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
    const kind = allowed[type.mime];
    const key = await storage.put(req.file.buffer, type.ext, type.mime, kind);
    try {
      const doc = await models.media.create({
        kind,
        storageProvider: storage.provider,
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
      await storage.remove(key, storage.provider).catch((cleanupError) => {
        console.error("Media upload cleanup failed", cleanupError.message);
      });
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
    res.set("Cache-Control", "private, no-store").type(doc.mimeType);
    if (doc.kind === "document")
      res.set("Content-Disposition", 'attachment; filename="document.pdf"');
    if (doc.storageProvider === "cloudinary") {
      const upstream = await storage.fetch(
        doc.storageKey,
        req.method,
        req.get("range"),
      );
      if (upstream.status === 416) {
        const range = upstream.headers.get("content-range");
        if (range) res.set("Content-Range", range);
        await upstream.body?.cancel();
        return res.status(416).end();
      }
      if (!upstream.ok) {
        await upstream.body?.cancel();
        throw error(
          "Media file unavailable.",
          upstream.status === 404 ? 404 : 502,
        );
      }
      for (const header of ["accept-ranges", "content-range", "content-length"]) {
        const value = upstream.headers.get(header);
        if (
          value &&
          (header !== "content-length" || !upstream.headers.has("content-encoding"))
        ) {
          res.set(header, value);
        }
      }
      res.status(upstream.status);
      if (!upstream.body) return res.end();
      return pipeline(Readable.fromWeb(upstream.body), res);
    }
    if (doc.storageProvider !== "local")
      throw error("Storage unavailable", 503);
    res.sendFile(storage.filePath(doc.storageKey), (err) => {
      if (err)
        next(error("Media file unavailable.", err.status === 404 ? 404 : 500));
    });
  }
  return { uploadMedia, serveMedia };
}
