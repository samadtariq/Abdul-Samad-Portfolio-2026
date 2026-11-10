import React from "react";
import { Blocks } from "../components/content/ContentBlocks.jsx";

export function PrivacyPage({ data, page }) {
  return (
    <section className="section">
      <h1 className="page-title">{page.record.title}</h1>
      <div className="detail-body">
        <Blocks blocks={page.record.content} data={data} />
      </div>
    </section>
  );
}
