import React from "react";
import { mediaUrl } from "../../utils/media.js";
import { Badge } from "../ui/Badge.jsx";

export function CardGrid({
  items,
  collection,
  empty = "New work is taking shape. Check back soon.",
}) {
  const prefix =
    { blog_posts: "blog", teasers: "coming-soon" }[collection] || collection;
  return items.length ? (
    <div className="grid cards">
      {items.map((item) => (
        <a
          className="card item-card"
          href={`/${prefix}/${item.slug}`}
          key={item._id}
        >
          {item.coverId || item.logoId ? (
            <div className="item-image">
              <img
                loading="lazy"
                src={mediaUrl(item.coverId || item.logoId)}
                alt={item.title || item.name}
              />
            </div>
          ) : (
            <div
              className={
                "item-image cover-placeholder " +
                (collection === "teasers" ? "dark" : "")
              }
            >
              <span>
                {collection === "ventures"
                  ? "VENTURE"
                  : collection === "blog_posts"
                    ? "FIELD NOTES"
                    : "SELECTED WORK"}
              </span>
              <strong>{item.name || item.title}</strong>
              <span>
                ABDUL SAMAD<span className="orange">.</span>
              </span>
            </div>
          )}
          <div className="card-body">
            <div className="meta">
              {item.progressStatus && <Badge>{item.progressStatus}</Badge>}
              {item.role && <span>{item.role}</span>}
              {item.readingTimeMinutes && (
                <span>{item.readingTimeMinutes} min read</span>
              )}
            </div>
            <h3>{item.title || item.name}</h3>
            <p>{item.summary || item.excerpt}</p>
            {item.technologies?.length > 0 && (
              <div className="tags">
                {item.technologies.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
            <span className="text-link">
              {collection === "blog_posts"
                ? "Read article"
                : collection === "ventures"
                  ? "Explore venture"
                  : "View details"}{" "}
              ↗
            </span>
          </div>
        </a>
      ))}
    </div>
  ) : (
    <div className="empty">{empty}</div>
  );
}
