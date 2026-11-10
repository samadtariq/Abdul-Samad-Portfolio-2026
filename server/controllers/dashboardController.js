import { models } from "../models/index.js";
export async function dashboard(req, res) {
  const counts = {};
  for (const name of ["projects", "ventures", "blog_posts", "inquiries"])
    counts[name] = await models[name].countDocuments(
      name === "inquiries" ? { status: "unread" } : {},
    );
  res.json({
    counts,
    recent: await models.audit_logs
      .find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
  });
}
