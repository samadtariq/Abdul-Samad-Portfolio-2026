import React from "react";
import { links } from "../../config/navigation.js";

export function Footer({ data }) {
  return (
    <footer className="footer">
      <a href="/" className="wordmark">
        {data.settings.name || "Abdul Samad"}
        <span>.</span>
      </a>
      <p>
        {data.settings.footerText ||
          "Development, design and a founder’s perspective."}
      </p>
      <div className="footer-links">
        {(data.settings.navigation?.length
          ? data.settings.navigation
              .filter((x) => x.visible && !x.parentKey)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((x) => [x.label, x.href])
          : links.slice(1)
        ).map(([l, u]) => (
          <a href={u} key={u}>
            {l}
          </a>
        ))}
        {data.items.pages.some((p) => p.key === "privacy") && (
          <a href="/privacy">Privacy Policy</a>
        )}
      </div>
      <small>
        © {new Date().getUTCFullYear()} {data.settings.name || "Abdul Samad"} ·{" "}
        {data.settings.location || "Karachi, Pakistan"}
      </small>
    </footer>
  );
}
