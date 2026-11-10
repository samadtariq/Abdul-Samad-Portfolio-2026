import { readFileSync } from "node:fs";
import path from "node:path";
import { clientRoot } from "../config/paths.js";
import { escapeHtml } from "./escapeHtml.js";
const template = readFileSync(path.join(clientRoot, "index.html"), "utf8");
export function html({
  title,
  description,
  body,
  data,
  noIndex = false,
  canonical,
  shareImage,
  structured,
}) {
  const json = (x) => JSON.stringify(x).replace(/</g, "\\u003c");
  const head = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">${noIndex ? '<meta name="robots" content="noindex,nofollow">' : ""}${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:url" content="${escapeHtml(canonical)}">` : ""}<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="${data?.path?.startsWith("/blog/") ? "article" : "website"}">${shareImage ? `<meta property="og:image" content="${escapeHtml(shareImage)}">` : ""}<meta name="twitter:card" content="summary_large_image">${structured ? `<script type="application/ld+json">${json(structured)}</script>` : ""}`;
  return template
    .replace("<!--PAGE_HEAD-->", () => head)
    .replace("<!--APP_BODY-->", () => body)
    .replace(
      "<!--APP_DATA-->",
      () =>
        `<script type="application/json" id="initial-data">${json(data)}</script>`,
    );
}
