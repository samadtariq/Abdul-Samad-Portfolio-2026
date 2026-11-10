import React from "react";
import { Blocks } from "../components/content/ContentBlocks.jsx";
import { CardGrid } from "../components/content/CardGrid.jsx";
import { Icon } from "../components/ui/Icon.jsx";

export function Listing({ data, collection, title, label }) {
  const q = (data.search.q || "").toLowerCase(),
    category = data.search.category || "",
    meta = data.listing;
  let items =
    meta?.collection === collection ? meta.items : data.items[collection] || [];
  const page = meta?.page || 1,
    total = meta?.total ?? items.length,
    size = meta?.size || 9;
  const categories =
    collection === "projects"
      ? [
          ["wordpress", "WordPress"],
          ["mern", "MERN Stack"],
          ["web_design", "Web Design"],
        ]
      : collection === "blog_posts"
        ? data.categories.map((c) => [c._id, c.name])
        : [];
  const record = data.items.pages.find(
    (x) =>
      x.key ===
      ({ blog_posts: "blog", teasers: "coming-soon" }[collection] ||
        collection),
  );
  return (
    <section className="section">
      <p className="eyebrow orange">{label}</p>
      <h1 className="page-title">{title}</h1>
      <p className="lead">
        {collection === "blog_posts"
          ? "Notes on development, design and the journey of building."
          : collection === "ventures"
            ? "Independent ventures. Shared curiosity. A founder’s perspective."
            : collection === "teasers"
              ? "Something new is taking shape. Explore what’s coming next."
              : "Thoughtful digital experiences, built with purpose."}
      </p>
      <Blocks blocks={record?.content} data={data} />
      <form className="filter-bar" method="get">
        <label className="search-label">
          <span className="sr-only">Search</span>
          <input
            name="q"
            placeholder="Search by title or keyword…"
            defaultValue={data.search.q || ""}
          />
        </label>
        {categories.length > 0 && (
          <label>
            <span className="sr-only">Category</span>
            <select name="category" defaultValue={category}>
              <option value="">All categories</option>
              {categories.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="button small">Search</button>
      </form>
      <CardGrid collection={collection} items={items} />
      <div className="pagination">
        {page > 1 && (
          <a
            href={`?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&page=${page - 1}`}
          >
            ← Previous
          </a>
        )}
        <span>
          Page {page} · {total} items
        </span>
        {page * size < total && (
          <a
            href={`?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&page=${page + 1}`}
          >
            Next →
          </a>
        )}
      </div>
      <div className="cta dark">
        <h2>Have something in mind?</h2>
        <a className="button accent" href="/contact">
          Let’s talk <Icon />
        </a>
      </div>
    </section>
  );
}
