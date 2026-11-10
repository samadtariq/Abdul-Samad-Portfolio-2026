import React from "react";
import { ContactSection } from "../components/contact/ContactSection.jsx";
import { Blocks } from "../components/content/ContentBlocks.jsx";

export function ContactPage({ data, page }) {
  return (
    <section className="section">
      <ContactSection data={data} main title={page.record?.title} />
      <Blocks blocks={page.record?.content} data={data} />
    </section>
  );
}
