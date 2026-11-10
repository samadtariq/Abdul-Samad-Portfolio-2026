import { models } from "../models/index.js";
import { query, loadData } from "../services/publicDataService.js";
import { renderPage } from "../services/ssrService.js";
import { html } from "../utils/html.js";
export function createPublicController({ origin }) {
  function robots(req, res) {
    return res
      .type("text/plain")
      .send(
        `User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /*?preview=\nSitemap: ${origin}/sitemap.xml\n`,
      );
  }

  async function sitemap(req, res) {
    const routes = [];
    const settings = await models.portfolio_settings
      .findOne({ key: "main" })
      .lean();
    if (!settings?.defaultSeo?.noIndex) {
      for (const p of await models.pages.find(query()).select("key seo").lean())
        if (!p.seo?.noIndex) routes.push(p.key === "home" ? "/" : "/" + p.key);
      for (const [n, prefix] of [
        ["services", "services"],
        ["projects", "projects"],
        ["ventures", "ventures"],
        ["blog_posts", "blog"],
        ["teasers", "coming-soon"],
      ])
        for (const doc of await models[n]
          .find(query())
          .select("slug seo")
          .lean())
          if (!doc.seo?.noIndex) routes.push(`/${prefix}/${doc.slug}`);
    }
    const esc = (x) =>
      x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(routes)].map((r) => `<url><loc>${esc(origin + r)}</loc></url>`).join("")}</urlset>`,
      );
  }

  async function adminPage(req, res) {
    res.set({
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    });
    const initial = {
      path: req.path,
      user: req.admin ? { name: req.admin.name, email: req.admin.email } : null,
    };
    res.type("html").send(
      html({
        title: "Admin · Abdul Samad",
        description: "Private content studio",
        body: '<div class="boot">Opening content studio…</div>',
        data: { admin: true, ...initial },
        noIndex: true,
      }),
    );
  }

  async function publicPage(req, res) {
    const data = await loadData(req);
    const { page, body } = await renderPage(data);
    const seo = page.record?.seo || {};
    const title =
      seo.title ||
      (page.type === "home"
        ? data.settings.defaultSeo?.title || page.title
        : `${page.title} · ${data.settings.name || "Abdul Samad"}`) +
        (data.listing?.page > 1 ? ` — Page ${data.listing.page}` : "");
    const description =
      seo.description ||
      page.record?.summary ||
      page.record?.excerpt ||
      data.settings.defaultSeo?.description ||
      "Web development, design and ventures by Abdul Samad in Karachi, Pakistan.";
    const noIndex = !!(
      data.preview ||
      page.status === 404 ||
      seo.noIndex ||
      data.settings.defaultSeo?.noIndex
    );
    const share = seo.shareImageId || data.settings.defaultSeo?.shareImageId;
    const configuredCanonical =
      seo.canonicalUrl ||
      (page.type === "home" ? data.settings.defaultSeo?.canonicalUrl : null);
    const canonical =
      configuredCanonical && /^https?:\/\//.test(configuredCanonical)
        ? configuredCanonical
        : origin + req.path;
    res
      .status(page.status || 200)
      .set("Cache-Control", data.preview ? "no-store" : "no-cache")
      .type("html")
      .send(
        html({
          title,
          description,
          noIndex,
          canonical,
          shareImage: share
            ? origin + "/media/" + share
            : origin + "/assets/abdul-samad.png",
          body,
          data: { ...data, siteUrl: origin },
          structured:
            page.collection === "blog_posts"
              ? {
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  headline: page.record.title,
                  description,
                  datePublished: page.record.publishedAt,
                  dateModified: page.record.updatedAt,
                  author: {
                    "@type": "Person",
                    name:
                      data.authors.find(
                        (a) => a._id === String(page.record.authorId),
                      )?.name || data.settings.name,
                  },
                  mainEntityOfPage: canonical,
                }
              : {
                  "@context": "https://schema.org",
                  "@type": "Person",
                  name: data.settings.name || "Abdul Samad",
                  url: origin,
                  jobTitle: "Web Developer",
                  ...(data.settings.location
                    ? { homeLocation: data.settings.location }
                    : {}),
                },
        }),
      );
  }
  return { robots, sitemap, adminPage, publicPage };
}
