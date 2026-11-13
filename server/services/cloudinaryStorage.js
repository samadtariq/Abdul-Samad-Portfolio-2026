import { createHash, randomBytes } from "node:crypto";

const deliveryType = "authenticated";
const resourceTypes = { image: "image", video: "video", document: "raw" };

function credentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const secret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !/^[a-z0-9_-]+$/i.test(cloudName) || !apiKey || !secret) {
    throw Object.assign(new Error("Cloudinary storage is not configured."), {
      status: 503,
    });
  }
  return { cloudName, apiKey, secret };
}

function asset(key) {
  const match = /^(image|video|raw)\/(portfolio-media-[a-f0-9]{40})\.([a-z0-9]+)$/.exec(key);
  if (!match) throw new Error("Invalid Cloudinary storage key");
  const [, resourceType, baseId, extension] = match;
  const filename = `${baseId}.${extension}`;
  return {
    resourceType,
    filename,
    publicId: resourceType === "raw" ? filename : baseId,
  };
}

async function cloudinaryRequest(resourceType, action, fields, file) {
  const { cloudName, apiKey, secret } = credentials();
  const params = { ...fields, timestamp: String(Math.floor(Date.now() / 1000)) };
  const signed = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const signature = createHash("sha256").update(signed + secret).digest("hex");
  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.set(key, value);
  form.set("api_key", apiKey);
  form.set("signature", signature);
  if (file) form.set("file", file.blob, file.name);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/${action}`,
    { method: "POST", body: form, signal: AbortSignal.timeout(20_000) },
  );
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Cloudinary ${action} failed (HTTP ${response.status})`);
  }
  return response.json();
}

export function createCloudinaryStorage() {
  return {
    async put(buffer, extension, mimeType, kind) {
      const resourceType = resourceTypes[kind];
      const id = randomBytes(20).toString("hex");
      const key = `${resourceType}/portfolio-media-${id}.${extension}`;
      const { publicId } = asset(key);
      const result = await cloudinaryRequest(resourceType, "upload", {
        public_id: publicId,
        type: deliveryType,
        overwrite: "false",
      }, {
        blob: new Blob([buffer], { type: mimeType }),
        name: `upload.${extension}`,
      });
      if (result.public_id !== publicId) {
        throw new Error("Cloudinary returned an unexpected asset ID");
      }
      return key;
    },
    async remove(key) {
      const { resourceType, publicId } = asset(key);
      const { result } = await cloudinaryRequest(resourceType, "destroy", {
        public_id: publicId,
        type: deliveryType,
        invalidate: "true",
      });
      if (result !== "ok" && result !== "not found") {
        throw new Error("Cloudinary did not confirm asset deletion");
      }
    },
    fetch(key, method, range) {
      const { resourceType, filename } = asset(key);
      const { cloudName, secret } = credentials();
      const signature = createHash("sha1")
        .update(filename + secret)
        .digest("base64url")
        .slice(0, 8);
      return fetch(
        `https://res.cloudinary.com/${cloudName}/${resourceType}/${deliveryType}/s--${signature}--/${filename}`,
        {
          method,
          headers: { "accept-encoding": "identity", ...(range ? { range } : {}) },
          signal: AbortSignal.timeout(30_000),
        },
      );
    },
  };
}
