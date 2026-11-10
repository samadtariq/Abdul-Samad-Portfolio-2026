import path from "node:path";
import { fileURLToPath } from "node:url";
export const serverRoot = fileURLToPath(new URL("../", import.meta.url));
export const clientRoot = path.resolve(serverRoot, "../client");
export const clientDist = path.join(clientRoot, "dist");
export const ssrEntry = new URL(
  "../../client/dist-ssr/render.mjs",
  import.meta.url,
);
export const uploadDirectory = () =>
  path.resolve(serverRoot, process.env.UPLOAD_DIR || "./uploads");
