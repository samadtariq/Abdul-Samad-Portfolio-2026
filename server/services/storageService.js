import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { createCloudinaryStorage } from "./cloudinaryStorage.js";

export function createStorage(directory, { useCloudinary = false } = {}) {
  const root = path.resolve(directory);
  const filePath = (key) => {
    if (!/^[a-f0-9]{40}\.[a-z0-9]+$/.test(key))
      throw new Error("Invalid storage key");
    return path.join(root, key);
  };
  const local = {
    async put(buffer, extension) {
      if (!/^[a-z0-9]+$/.test(extension))
        throw new Error("Invalid file extension");
      await mkdir(root, { recursive: true });
      const key = randomBytes(20).toString("hex") + "." + extension;
      await writeFile(filePath(key), buffer, { flag: "wx" });
      return key;
    },
    async remove(key) {
      await unlink(filePath(key)).catch((e) => {
        if (e.code !== "ENOENT") throw e;
      });
    },
  };
  const cloudinary = createCloudinaryStorage();
  return {
    provider: useCloudinary ? "cloudinary" : "local",
    filePath,
    async put(buffer, extension, mimeType, kind) {
      return useCloudinary
        ? cloudinary.put(buffer, extension, mimeType, kind)
        : local.put(buffer, extension);
    },
    async remove(key, provider = "local") {
      if (provider === "local") return local.remove(key);
      if (provider === "cloudinary") return cloudinary.remove(key);
      throw new Error("Unsupported storage provider");
    },
    fetch: cloudinary.fetch,
  };
}
