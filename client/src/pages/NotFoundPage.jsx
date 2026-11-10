import React from "react";

export function NotFoundPage({ data, page }) {
  return (
    <section className="section not-found">
      <div className="terminal">
        404 / ROUTE NOT FOUND<span>Let’s find another way.</span>
      </div>
      <h1>Page Not Found.</h1>
      <p>This page may have moved, or the story is still being written.</p>
      <div className="actions">
        <a className="button" href="/">
          Return Home
        </a>
        <a className="button outline" href="/projects">
          Browse Projects
        </a>
      </div>
    </section>
  );
}
