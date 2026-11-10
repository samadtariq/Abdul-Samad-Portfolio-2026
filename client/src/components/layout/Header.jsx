import React, { useState } from "react";
import { links } from "../../config/navigation.js";
import { Icon } from "../ui/Icon.jsx";
import { Modal } from "../ui/Modal.jsx";

export function Header({ settings, path }) {
  const [more, setMore] = useState(false);
  const all =
    settings.navigation
      ?.filter((x) => x.visible)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) || [];
  const nav = settings.navigation?.length
    ? all.filter((x) => !x.parentKey)
    : links.map(([label, href]) => ({ label, href }));
  const mobile = settings.mobileNavigation?.length
    ? settings.mobileNavigation.filter((x) => x.visible)
    : [
        ["Home", "/"],
        ["Projects", "/projects"],
        ["Ventures", "/ventures"],
        ["Blog", "/blog"],
        ["More", "#more"],
      ].map(([label, url]) => ({ label, url }));
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <a className="wordmark" href="/">
          {settings.name || "Abdul Samad"}
          <span>.</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((n) => {
            const sub = all.filter((x) => x.parentKey === n.key);
            return sub.length ? (
              <div className="nav-group" key={n.key}>
                <a href={n.href}>{n.label}</a>
                <details>
                  <summary aria-label={"Show " + n.label + " links"}>⌄</summary>
                  <div>
                    {sub.map((x) => (
                      <a href={x.href} key={x.key}>
                        {x.label}
                      </a>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <a
                key={n.href}
                href={n.href}
                aria-current={path === n.href ? "page" : undefined}
              >
                {n.label}
              </a>
            );
          })}
        </nav>
        <a className="button small" href="/contact">
          Let’s Talk <span className="dot" />
        </a>
      </header>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {mobile.map(({ label, url }) =>
          url === "#more" ? (
            <button
              key={url}
              onClick={() => setMore(true)}
              aria-expanded={more}
            >
              <Icon name="more" />
              {label}
            </button>
          ) : (
            <a
              key={url}
              href={url}
              aria-current={path === url ? "page" : undefined}
            >
              <Icon name={url === "/" ? "home" : url.slice(1)} />
              {label}
            </a>
          ),
        )}
      </nav>
      {more && (
        <Modal title="Explore more" onClose={() => setMore(false)}>
          <div className="more-links">
            {[
              ["About", "/about"],
              ["Services", "/services"],
              ["Contact", "/contact"],
            ].map(([l, u]) => (
              <a href={u} key={u}>
                {l}
                <Icon />
              </a>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
