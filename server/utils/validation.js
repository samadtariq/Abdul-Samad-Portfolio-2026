import { definitions } from "../config/schema.js";
export { definitions } from "../config/schema.js";
import mongoose from "mongoose";
import { models } from "../models/index.js";
export const editable = [
  "portfolio_settings",
  "pages",
  "home_sections",
  "services",
  "skill_items",
  "projects",
  "ventures",
  "teasers",
  "blog_categories",
  "blog_posts",
  "inquiries",
  "media",
  "private_notes",
];
export const validId = (id) =>
  typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
export const error = (message, status = 400) =>
  Object.assign(new Error(message), { status });
export function safeUrl(value, { local = true } = {}) {
  if (!value) return true;
  if (
    local &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\s]/.test(value)
  )
    return true;
  if (local && /^#[A-Za-z][A-Za-z0-9_-]*$/.test(value)) return true;
  try {
    const u = new URL(value);
    return (
      ["https:", "http:", "mailto:", "tel:"].includes(u.protocol) &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}
export function youtubeId(url) {
  try {
    const u = new URL(url);
    if (
      !["www.youtube.com", "youtube.com", "youtu.be"].includes(u.hostname) ||
      u.protocol !== "https:"
    )
      return null;
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : u.searchParams.get("v") || u.pathname.split("/embed/")[1];
    return /^[\w-]{11}$/.test(id || "") ? id : null;
  } catch {
    return null;
  }
}
const refs = {
  mediaId: "media",
  portraitId: "media",
  videoId: "media",
  coverId: "media",
  logoId: "media",
  profileImageId: "media",
  resumeId: "media",
  heroVideoId: "media",
  iconMediaId: "media",
  shareImageId: "media",
  authorId: "admins",
  authorIdOverride: "admins",
  uploadedBy: "admins",
  serviceId: "services",
  categoryIds: "blog_categories",
  relatedProjectIds: "projects",
  featuredProjectIds: "projects",
  relatedServiceIds: "services",
  featuredServiceIds: "services",
  featuredVentureIds: "ventures",
  featuredPostIds: "blog_posts",
  relatedPostIds: "blog_posts",
  featuredTeaserIds: "teasers",
};
export async function validateInput(name, body, existing = {}) {
  const schema = definitions[name].validator.$jsonSchema;
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw error("Expected an object");
  const forbidden = ["_id", "createdAt", "updatedAt"];
  for (const key of Object.keys(body))
    if (forbidden.includes(key) || !schema.properties[key])
      throw error(`Unknown or protected field: ${key}`);
  let value = { ...existing, ...body };
  if (
    name === "portfolio_settings" &&
    value.heroMediaType === "video" &&
    !value.heroVideoId
  )
    throw error("Choose a video or use photo mode.");
  if (
    name === "pages" &&
    value.key &&
    ![
      "home",
      "about",
      "services",
      "projects",
      "ventures",
      "blog",
      "coming-soon",
      "contact",
      "privacy",
    ].includes(value.key)
  )
    throw error("Choose a supported page key.");
  const fieldErrors = {};
  const pretty = (path) =>
    path
      .replace(/\[(\d+)\]/g, (_, n) => ` ${Number(n) + 1}`)
      .split(".")
      .map((x) =>
        x.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      )
      .join(" → ");
  const invalid = (path, message) => {
    fieldErrors[path] = message;
  };
  async function walk(item, key = "", parent = {}, path = "") {
    if (Array.isArray(item)) {
      for (const [index, entry] of item.entries())
        await walk(entry, key, parent, `${path}[${index}]`);
      return;
    }
    if (
      item &&
      typeof item === "object" &&
      !(item instanceof Date) &&
      !item._bsontype
    ) {
      if (item.type) {
        if (["image", "video"].includes(item.type) && !item.mediaId)
          throw error(`${item.type} block requires media`);
        if (item.type === "link" && (!item.url || !item.text))
          throw error("Link needs a label and destination");
        if (item.type === "youtube" && !youtubeId(item.url))
          invalid(
            `${path}.url`,
            `${pretty(path)} → YouTube URL: use a valid HTTPS YouTube watch/share link.`,
          );
        if (item.type === "heading" && (!item.text || !item.level))
          throw error("Heading needs text and level");
      }
      for (const [k, v] of Object.entries(item))
        await walk(v, k, item, path ? `${path}.${k}` : k);
      return;
    }
    if (
      typeof item === "string" &&
      (key === "url" || key === "href" || /Url$/.test(key)) &&
      !safeUrl(item)
    )
      invalid(
        path,
        `${pretty(path)}${parent.platform ? ` (${parent.platform})` : ""}: enter a complete link, for example https://example.com.`,
      );
    if (refs[key] && item) {
      const id = String(item);
      if (!validId(id) || !(await models[refs[key]].exists({ _id: id })))
        throw error(`Reference does not exist: ${key}`);
      if (refs[key] === "media") {
        const media = await models.media.findById(id);
        const kind =
          [
            "coverId",
            "logoId",
            "profileImageId",
            "shareImageId",
            "iconMediaId",
            "portraitId",
          ].includes(key) || parent.type === "image"
            ? "image"
            : ["heroVideoId", "videoId"].includes(key) ||
                parent.type === "video"
              ? "video"
              : key === "resumeId"
                ? "document"
                : null;
        if (
          key === "mediaId" &&
          !parent.type &&
          !["image", "video"].includes(media.kind)
        )
          throw error("Gallery requires image or video media");
        if (kind && media.kind !== kind)
          throw error(`${key} requires ${kind} media`);
      }
    }
  }
  await walk(value);
  if (Object.keys(fieldErrors).length)
    throw Object.assign(error(Object.values(fieldErrors).join(" ")), {
      fieldErrors,
    });
  if (name === "portfolio_settings" && value.key !== "main")
    throw error("Only the main settings document is supported");
  if (name === "blog_posts" && Array.isArray(value.content))
    value.readingTimeMinutes = Math.max(
      1,
      Math.ceil(
        value.content
          .map((b) => b.text || "")
          .join(" ")
          .split(/\s+/).length / 200,
      ),
    );
  if (name === "teasers" || name === "private_notes") {
    const target = {
      project: "projects",
      venture: "ventures",
      inquiry: "inquiries",
    }[value.targetType];
    if (
      !target ||
      !validId(String(value.targetId)) ||
      !(await models[target].exists({ _id: value.targetId }))
    )
      throw error("Invalid target");
  }
  if (value.publicationStatus === "published") {
    if (
      ["projects", "ventures", "teasers", "blog_posts", "services"].includes(
        name,
      ) &&
      !(value.summary || value.excerpt || value.content?.length)
    )
      throw error("Add public content before publishing");
    value.publishedAt =
      existing.publicationStatus === "published" && existing.publishedAt
        ? existing.publishedAt
        : new Date();
  }
  if (value.email) value.email = value.email.trim().toLowerCase();
  if (name === "inquiries") {
    const allowed = Object.keys(body).every((x) =>
      ["status", "readAt", "archivedAt"].includes(x),
    );
    if (!allowed) throw error("Only inquiry status can be edited");
    if (body.status === "read") value.readAt = new Date();
    if (body.status === "archived") value.archivedAt = new Date();
  }
  return value;
}
export function referenced(value, id) {
  if (value == null) return false;
  if (typeof value === "object" && value._bsontype) return String(value) === id;
  if (typeof value === "string") return value === id;
  if (Array.isArray(value)) return value.some((v) => referenced(v, id));
  if (typeof value === "object")
    return Object.entries(value).some(
      ([k, v]) => k !== "_id" && referenced(v, id),
    );
  return false;
}
const referencePaths = (spec) => {
  const paths = [];
  function walk(value, prefix = "") {
    if (value.bsonType === "objectId") {
      if (prefix !== "_id") paths.push(prefix);
      return;
    }
    if (value.bsonType === "array") return walk(value.items, prefix);
    for (const [k, v] of Object.entries(value.properties || {}))
      walk(v, prefix ? prefix + "." + k : k);
  }
  walk(spec);
  return paths;
};
const pathsByCollection = Object.fromEntries(
  Object.entries(definitions).map(([n, d]) => [
    n,
    referencePaths(d.validator.$jsonSchema),
  ]),
);
export async function usages(id, { publicOnly = false } = {}) {
  if (!validId(String(id))) return [];
  const found = [],
    publicNames = [
      "portfolio_settings",
      "pages",
      "home_sections",
      "services",
      "projects",
      "ventures",
      "teasers",
      "blog_posts",
      "skill_items",
    ];
  for (const name of publicOnly ? publicNames : editable) {
    const properties = definitions[name].validator.$jsonSchema.properties,
      paths = pathsByCollection[name];
    if (!paths.length) continue;
    const q = {
      $or: paths.map((p) => ({ [p]: new mongoose.Types.ObjectId(id) })),
    };
    if (publicOnly && properties.publicationStatus)
      Object.assign(q, {
        publicationStatus: "published",
        publishedAt: { $lte: new Date() },
      });
    if (publicOnly && properties.visible) q.visible = { $ne: false };
    const docs = await models[name].find(q).select("_id title name key").lean();
    found.push(
      ...docs.map((d) => ({
        collection: name,
        id: String(d._id),
        title: d.title || d.name || d.key,
      })),
    );
  }
  return found;
}
