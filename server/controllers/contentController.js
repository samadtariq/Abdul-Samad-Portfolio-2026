import { models } from "../models/index.js";
import {
  definitions,
  editable,
  error,
  validId,
  validateInput,
  usages,
} from "../utils/validation.js";
import { audit } from "../services/auditService.js";
export function createContentController({ storage }) {
  function schema(req, res) {
    return res.json({
      collections: Object.fromEntries(editable.map((n) => [n, definitions[n]])),
    });
  }

  async function referenceOptions(req, res) {
    const result = {};
    for (const n of [
      "media",
      "admins",
      "projects",
      "ventures",
      "services",
      "blog_posts",
      "blog_categories",
      "teasers",
      "inquiries",
    ])
      result[n] = await models[n]
        .find()
        .select("_id name title originalName kind")
        .limit(1000)
        .lean();
    res.json(result);
  }

  async function list(req, res) {
    const name = req.params.collection;
    if (!editable.includes(name)) throw error("Unknown collection", 404);
    const page = Math.min(1000000, Math.max(1, parseInt(req.query.page) || 1)),
      limit = 25;
    const q = {};
    const schema = definitions[name].validator.$jsonSchema.properties;
    if (req.query.status && schema.publicationStatus)
      q.publicationStatus = req.query.status;
    if (req.query.group && schema.group) q.group = req.query.group;
    if (name === "media" && req.query.kind) {
      const kinds = String(req.query.kind).split(",");
      if (kinds.some((kind) => !["image", "video", "document"].includes(kind)))
        throw error("Unknown media type.");
      q.kind = { $in: kinds };
    }
    if (req.query.q) {
      const escaped = String(req.query.q)
        .slice(0, 150)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      q.$or = ["title", "name", "key", "email", "originalName"]
        .filter((k) => schema[k])
        .map((k) => ({ [k]: { $regex: escaped, $options: "i" } }));
    }
    res.json({
      items: await models[name]
        .find(q)
        .sort(
          name === "home_sections" ? { displayOrder: 1 } : { createdAt: -1 },
        )
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      total: await models[name].countDocuments(q),
      page,
      limit,
    });
  }

  async function get(req, res) {
    const n = req.params.collection;
    if (!editable.includes(n) || !validId(req.params.id))
      throw error("Not found", 404);
    const doc = await models[n].findById(req.params.id).lean();
    if (!doc) throw error("Not found", 404);
    res.json(doc);
  }

  async function create(req, res) {
    const n = req.params.collection;
    if (!editable.includes(n) || ["media", "inquiries"].includes(n))
      throw error("Action not allowed", 405);
    const data = await validateInput(n, req.body);
    const created = await models[n].create(data);
    await audit(req, n, created._id, "create");
    res.status(201).json(created);
  }

  async function update(req, res) {
    const n = req.params.collection;
    if (!editable.includes(n) || !validId(req.params.id))
      throw error("Not found", 404);
    if (
      n === "media" &&
      Object.keys(req.body).some((k) => !["alt", "caption"].includes(k))
    )
      throw error("Only alt text and caption can be edited here.");
    const doc = await models[n].findById(req.params.id);
    if (!doc) throw error("Not found", 404);
    const base = doc.toObject();
    delete base._id;
    delete base.createdAt;
    delete base.updatedAt;
    const data = await validateInput(
      n,
      req.body,
      ["media", "inquiries"].includes(n)
        ? base
        : base.publicationStatus
          ? {
              publicationStatus: base.publicationStatus,
              publishedAt: base.publishedAt,
            }
          : {},
    );
    if (["media", "inquiries"].includes(n)) doc.set(data);
    else {
      delete data.publishedAt;
      if (data.publicationStatus === "published")
        data.publishedAt =
          base.publicationStatus === "published" && base.publishedAt
            ? base.publishedAt
            : new Date();
      doc.overwrite({
        ...data,
        createdAt: doc.createdAt,
        updatedAt: new Date(),
      });
    }
    await doc.save();
    await audit(req, n, doc._id, "update");
    res.json(doc);
  }

  async function remove(req, res) {
    const n = req.params.collection,
      id = req.params.id;
    if (!editable.includes(n) || !validId(id)) throw error("Not found", 404);
    if (["portfolio_settings", "home_sections", "pages"].includes(n))
      throw error("Use visibility or publication controls for this record.");
    const used = await usages(id);
    if (used.length)
      throw error(
        "This item is referenced. Remove its references before deleting.",
      );
    const doc = await models[n].findById(id);
    if (!doc) throw error("Not found", 404);
    if (n === "media") await storage.remove(doc.storageKey);
    await doc.deleteOne();
    await audit(req, n, doc._id, "delete");
    res.json({ ok: true });
  }
  return { schema, referenceOptions, list, get, create, update, remove };
}
