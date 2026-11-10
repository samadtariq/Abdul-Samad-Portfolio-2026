import React from "react";
import { ContactForm } from "./ContactForm.jsx";

export function ContactSection({ data, main = false, title }) {
  const Heading = main ? "h1" : "h2";
  return (
    <div className="contact-grid">
      <div>
        <p className="eyebrow orange">LET’S TALK</p>
        <Heading className="statement">
          {title || (
            <>
              Let’s build something <span className="orange">meaningful.</span>
            </>
          )}
        </Heading>
        <p>
          Have an idea, a project, or just want to connect? Let’s start a
          conversation.
        </p>
        <div className="contact-details">
          <span>⌖ {data.settings.location || "Karachi, Pakistan"}</span>
          {data.settings.email && (
            <a href={`mailto:${data.settings.email}`}>{data.settings.email}</a>
          )}
          {data.settings.phone && (
            <a href={`tel:${data.settings.phone}`}>{data.settings.phone}</a>
          )}
        </div>
      </div>
      <ContactForm services={data.items.services} />
    </div>
  );
}
