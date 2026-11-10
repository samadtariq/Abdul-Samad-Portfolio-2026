import multer from "multer";
export function createUploadMiddleware() {
  const maxSize =
    Math.min(200, Math.max(1, Number(process.env.UPLOAD_MAX_MB) || 25)) *
    1024 *
    1024;
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize, files: 1 },
  });
}
