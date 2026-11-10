import React from "react";
import { text } from "../utils/text.js";
import { Badge } from "../components/ui/Badge.jsx";
import { Countdown } from "../components/content/Countdown.jsx";
import { mediaUrl } from "../utils/media.js";
import { Blocks } from "../components/content/ContentBlocks.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { CardGrid } from "../components/content/CardGrid.jsx";
import { Icon } from "../components/ui/Icon.jsx";

export function Detail({ page, data }) {
  const v = page.record;
  const prefix =
    { blog_posts: "blog", teasers: "coming-soon" }[page.collection] ||
    page.collection;
  const relatedKey =
    page.collection === "blog_posts" ? "relatedPostIds" : "relatedProjectIds";
  const relatedCollection =
    page.collection === "blog_posts" ? "blog_posts" : "projects";
  const related = data.items[relatedCollection].filter((x) =>
    v[relatedKey]?.includes(x._id),
  );
  const relatedServices = data.items.services.filter((x) =>
    v.relatedServiceIds?.includes(x._id),
  );
  const targetCollection = { project: "projects", venture: "ventures" }[
    v.targetType
  ];
  const target =
    targetCollection &&
    data.items[targetCollection].find((x) => x._id === v.targetId);
  return (
    <section className="section detail">
      <a className="text-link" href={"/" + prefix}>
        ← Back to {prefix.replace("-", " ")}
      </a>
      <div className="detail-heading">
        <p className="eyebrow orange">
          {page.collection === "blog_posts"
            ? "FIELD NOTES"
            : text(v.progressStatus || "CAPABILITIES")}
        </p>
        <h1>{v.title || v.name}</h1>
        <p className="lead">{v.summary || v.excerpt}</p>
        <div className="meta">
          {v.role && <Badge>{v.role}</Badge>}
          {v.progressStatus && <Badge>{v.progressStatus}</Badge>}
          {v.publishedAt && page.collection === "blog_posts" && (
            <>
              <span>
                Published {new Date(v.publishedAt).toISOString().slice(0, 10)}
              </span>
              {v.updatedAt &&
                new Date(v.updatedAt).toISOString().slice(0, 10) !==
                  new Date(v.publishedAt).toISOString().slice(0, 10) && (
                  <span>
                    Updated {new Date(v.updatedAt).toISOString().slice(0, 10)}
                  </span>
                )}
              <span>
                {data.authors.find((a) => a._id === v.authorId)?.name ||
                  "Abdul Samad"}
              </span>
              <span>{v.readingTimeMinutes || 1} min read</span>
            </>
          )}
          {v.launchAt && <Countdown date={v.launchAt} />}
        </div>
      </div>
      {v.coverId && (
        <img
          className="detail-cover"
          src={mediaUrl(v.coverId)}
          alt={v.title || v.name}
        />
      )}
      <div className="detail-body">
        <Blocks blocks={v.content} data={data} />
        {v.videoId && (
          <video controls src={mediaUrl(v.videoId)} preload="metadata" />
        )}
        {v.capabilities?.length > 0 && (
          <>
            <h2>What I can help with</h2>
            <ul>
              {v.capabilities.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </>
        )}
        {v.deliverables?.length > 0 && (
          <>
            <h2>Deliverables</h2>
            <ul>
              {v.deliverables.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </>
        )}
        {v.technologies?.length > 0 && (
          <div className="tags">
            {v.technologies.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
        {v.gallery?.map((m, i) => (
          <figure key={i}>
            {data.media?.find((x) => x._id === m.mediaId)?.kind === "video" ? (
              <video controls preload="metadata" src={mediaUrl(m.mediaId)} />
            ) : (
              <a href={mediaUrl(m.mediaId)}>
                <img
                  loading="lazy"
                  src={mediaUrl(m.mediaId)}
                  alt={m.alt || ""}
                />
              </a>
            )}
            <figcaption>{m.caption}</figcaption>
          </figure>
        ))}
        {v.process?.length > 0 && (
          <>
            <h2>Our process</h2>
            <div className="grid process-grid">
              {v.process.map((x, i) => (
                <div className="card" key={i}>
                  <span className="eyebrow orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{x.title}</h3>
                  <p>{x.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {v.faqs?.length > 0 && (
          <>
            <h2>Frequently Asked Questions</h2>
            {v.faqs.map((f, i) => (
              <details key={i}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </>
        )}
        {target && (
          <p>
            <a
              className="text-link"
              href={"/" + targetCollection + "/" + target.slug}
            >
              Explore {target.name || target.title} ↗
            </a>
          </p>
        )}
        {relatedServices.length > 0 && (
          <div className="tags">
            {relatedServices.map((x) => (
              <a key={x._id} href={"/services/" + x.slug}>
                {x.title} ↗
              </a>
            ))}
          </div>
        )}
        <div className="actions">
          {v.websiteUrl && (
            <a
              className="button"
              href={v.websiteUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Visit Website ↗
            </a>
          )}
          {v.repositoryUrl && (
            <a
              className="button outline"
              href={v.repositoryUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              View Code ↗
            </a>
          )}
          {v.socialLinks
            ?.filter((x) => x.visible)
            .map((x, i) => (
              <a key={i} href={x.url}>
                {x.label} ↗
              </a>
            ))}
        </div>
      </div>
      {related.length > 0 && (
        <>
          <SectionTitle title="Continue exploring" label="RELATED" />
          <CardGrid collection={relatedCollection} items={related} />
        </>
      )}
      <div className="cta dark">
        <h2>Let’s bring your idea to life.</h2>
        <a className="button accent" href="/contact">
          Start a conversation <Icon />
        </a>
      </div>
    </section>
  );
}
