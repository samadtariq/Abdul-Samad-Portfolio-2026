import React from "react";
import { mediaUrl } from "../../utils/media.js";

export function Blocks({ blocks = [], data }) {
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        const src = mediaUrl(b.mediaId);
        const caption = b.caption;
        if (b.type === "heading") {
          const H = "h" + Math.min(6, Math.max(2, b.level || 2));
          return <H key={i}>{b.text}</H>;
        }
        if (b.type === "image")
          return (
            <figure key={i}>
              <img loading="lazy" src={src} alt={b.alt || ""} />
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          );
        if (b.type === "video")
          return (
            <figure key={i}>
              <video controls preload="metadata" src={src} />
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          );
        if (b.type === "youtube") {
          let id;
          try {
            const u = new URL(b.url);
            id =
              u.hostname === "youtu.be"
                ? u.pathname.slice(1)
                : u.searchParams.get("v") || u.pathname.split("/embed/")[1];
          } catch {}
          return /^[\w-]{11}$/.test(id || "") ? (
            <figure key={i}>
              <iframe
                title={caption || "YouTube video"}
                loading="lazy"
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                allowFullScreen
              />
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          ) : null;
        }
        if (b.type === "link")
          return (
            <p key={i}>
              <a className="text-link" href={b.url} rel="noopener noreferrer">
                {b.text} ↗
              </a>
            </p>
          );
        if (b.type === "quote")
          return <blockquote key={i}>{b.text}</blockquote>;
        if (b.type === "code")
          return (
            <pre key={i}>
              <code>{b.text}</code>
            </pre>
          );
        if (b.type === "list") {
          const L = b.ordered ? "ol" : "ul";
          return (
            <L key={i}>
              {b.items?.map((x, j) => (
                <li key={j}>{x}</li>
              ))}
            </L>
          );
        }
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}
