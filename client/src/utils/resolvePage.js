export function resolvePage(data) {
  const path = data.path.replace(/\/$/, "") || "/";
  const map = {
    "/": ["home", "Home"],
    "/about": ["about", "About"],
    "/services": ["services", "Services"],
    "/projects": ["projects", "Selected Work"],
    "/ventures": ["ventures", "Ventures & Companies"],
    "/blog": ["blog", "Blog & Articles"],
    "/coming-soon": ["teasers", "Coming Soon"],
    "/contact": ["contact", "Contact"],
    "/privacy": ["privacy", "Privacy Policy"],
  };
  if (map[path]) {
    const [type, title] = map[path];
    const record = data.items.pages?.find(
      (x) => x.key === ({ teasers: "coming-soon" }[type] || type),
    );
    if (!record) return { type: "404", title: "Page Not Found", status: 404 };
    return { type, title: record?.title || title, record };
  }
  const [, prefix, slug, ...rest] = path.split("/");
  const collection = {
    services: "services",
    projects: "projects",
    ventures: "ventures",
    blog: "blog_posts",
    "coming-soon": "teasers",
  }[prefix];
  if (collection && slug && !rest.length) {
    const record = data.items[collection]?.find((x) => x.slug === slug);
    if (record)
      return {
        type: "detail",
        collection,
        record,
        title: record.title || record.name,
      };
  }
  return { type: "404", title: "Page Not Found", status: 404 };
}
