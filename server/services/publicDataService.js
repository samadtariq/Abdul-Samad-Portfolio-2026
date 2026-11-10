import { models, Admin } from "../models/index.js";
import { definitions, validId, error } from "../utils/validation.js";
import { clean } from "../utils/serialize.js";
export const query = () => ({
  publicationStatus: "published",
  publishedAt: { $lte: new Date() },
});
export async function loadData(req) {
  const currentPath = req.path.replace(/\/$/, "") || "/";
  const names = [
    "pages",
    "services",
    "projects",
    "ventures",
    "teasers",
    "blog_posts",
  ];
  const data = {
    settings:
      (await models.portfolio_settings.findOne({ key: "main" }).lean()) || {},
    sections: [],
    skills: [],
    items: Object.fromEntries(names.map((n) => [n, []])),
    categories: [],
    path: req.path,
    search: Object.fromEntries(
      new URLSearchParams(req.url.split("?")[1] || ""),
    ),
  };
  data.items.pages = await models.pages.find(query()).lean();
  data.items.services = await models.services
    .find(query())
    .sort({ displayOrder: 1 })
    .lean();
  const floating = data.settings.floatingControls || {};
  data.items.teasers = await models.teasers
    .find({
      ...query(),
      ...(floating.featuredTeaserIds?.length
        ? { _id: { $in: floating.featuredTeaserIds } }
        : {}),
    })
    .sort({ displayOrder: 1, publishedAt: -1 })
    .limit(4)
    .lean();
  if (currentPath === "/") {
    data.sections = await models.home_sections
      .find({ visible: true })
      .sort({ displayOrder: 1 })
      .lean();
    data.skills = await models.skill_items
      .find({ visible: true })
      .sort({ displayOrder: 1 })
      .lean();
    for (const [n, field] of [
      ["projects", "featuredProjectIds"],
      ["ventures", "featuredVentureIds"],
      ["blog_posts", "featuredPostIds"],
    ]) {
      const ids = data.sections.flatMap((s) => s[field] || []);
      const selected = ids.length
        ? await models[n]
            .find({ ...query(), _id: { $in: ids } })
            .select("-content -gallery")
            .lean()
        : [];
      const recent = await models[n]
        .find(query())
        .select("-content -gallery")
        .sort({ displayOrder: 1, publishedAt: -1 })
        .limit(9)
        .lean();
      data.items[n] = [
        ...selected,
        ...recent.filter(
          (x) => !selected.some((y) => String(x._id) === String(y._id)),
        ),
      ];
    }
  }
  if (currentPath === "/about")
    data.items.ventures = await models.ventures
      .find(query())
      .select("-content -gallery")
      .sort({ displayOrder: 1 })
      .lean();
  const lists = {
      "/projects": "projects",
      "/ventures": "ventures",
      "/blog": "blog_posts",
      "/coming-soon": "teasers",
    },
    collection = lists[currentPath];
  if (collection) {
    const q = { ...query() },
      term = (data.search.q || "").slice(0, 150),
      category = data.search.category || "";
    if (term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      q.$or = ["title", "name", "summary", "excerpt"]
        .filter(
          (k) => definitions[collection].validator.$jsonSchema.properties[k],
        )
        .map((k) => ({ [k]: { $regex: escaped, $options: "i" } }));
    }
    if (category && collection === "projects") q.category = category;
    if (category && collection === "blog_posts")
      q.categoryIds = validId(category) ? category : "000000000000000000000000";
    const total = await models[collection].countDocuments(q),
      size = 9,
      page = Math.min(
        Math.max(1, parseInt(data.search.page) || 1),
        Math.max(1, Math.ceil(total / size)),
      );
    const rows = await models[collection]
      .find(q)
      .select("-content -gallery")
      .sort({ displayOrder: 1, publishedAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean();
    // Keep floating teasers available even when searching the Coming Soon listing.
    data.listing = { collection, total, page, size, items: rows };
    data.items[collection] = rows;
    if (collection === "blog_posts")
      data.categories = await models.blog_categories
        .find()
        .sort({ name: 1 })
        .lean();
  }
  const match = currentPath.match(
    /^\/(services|projects|ventures|blog|coming-soon)\/([^/]+)$/,
  );
  if (match) {
    const n =
      { blog: "blog_posts", "coming-soon": "teasers" }[match[1]] || match[1];
    const record = await models[n]
      .findOne({ ...query(), slug: match[2] })
      .lean();
    if (record)
      data.items[n] = [
        record,
        ...data.items[n].filter((x) => String(x._id) !== String(record._id)),
      ];
  }
  if (req.query.preview) {
    if (!req.admin) throw error("Sign in to preview.", 401);
    const [n, id] = String(req.query.preview).split(":");
    if (!names.includes(n) || !validId(id)) throw error("Invalid preview");
    const doc = await models[n].findById(id).lean();
    if (!doc) throw error("Preview not found", 404);
    data.items[n] = [doc, ...data.items[n].filter((x) => String(x._id) !== id)];
    data.preview = true;
  }
  // Load related records only when needed; every relationship is publication-filtered.
  if (match) {
    const n =
        { blog: "blog_posts", "coming-soon": "teasers" }[match[1]] || match[1],
      record = data.items[n].find((x) => x.slug === match[2]);
    if (record) {
      for (const [related, field] of [
        ["projects", "relatedProjectIds"],
        ["blog_posts", "relatedPostIds"],
        ["services", "relatedServiceIds"],
      ])
        if (record[field]?.length) {
          const rows = await models[related]
            .find({ ...query(), _id: { $in: record[field] } })
            .select("-content -gallery")
            .lean();
          data.items[related] = [
            ...data.items[related],
            ...rows.filter(
              (x) =>
                !data.items[related].some(
                  (y) => String(x._id) === String(y._id),
                ),
            ),
          ];
        }
      if (n === "teasers") {
        const target = { project: "projects", venture: "ventures" }[
          record.targetType
        ];
        if (target) {
          const doc = await models[target]
            .findOne({ ...query(), _id: record.targetId })
            .select("-content -gallery")
            .lean();
          if (doc) data.items[target].push(doc);
        }
      }
    }
  }
  const ids = new Set();
  function refs(v, key = "") {
    if (Array.isArray(v)) {
      v.forEach((x) => refs(x, key));
      return;
    }
    if (v && typeof v === "object" && !v._bsontype) {
      Object.entries(v).forEach(([k, x]) => refs(x, k));
      return;
    }
    if (/Ids?$/.test(key) && v && validId(String(v))) ids.add(String(v));
  }
  refs(data);
  data.media = await models.media
    .find({ _id: { $in: [...ids] } })
    .select("_id kind alt caption")
    .lean();
  data.authors = await Admin.find({
    _id: { $in: data.items.blog_posts.map((x) => x.authorId) },
  })
    .select("_id name")
    .lean();
  return clean(data);
}
