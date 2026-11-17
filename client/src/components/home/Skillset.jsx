import React, { useId, useRef } from "react";
import { useSectionReveal } from "./useSectionReveal.js";

const categories = [
  ["Web Platforms", [
    ["WordPress", "WP", "wordpress"], ["WooCommerce", "WOO", "wordpress"],
    ["Elementor", "E", "wordpress"], ["OpenCart", "OC", "opencart"],
  ]],
  ["Full Stack", [
    ["React", "RE", "mern"], ["Node.js", "JS", "mern"], ["Express", "EX", "mern"],
    ["MongoDB", "MDB", "mern"], ["REST APIs", "API", "mern"],
  ]],
  ["Mobile", [["Flutter", "FL", "flutter"], ["Dart", "D", "flutter"]]],
  ["Backend", [
    ["Laravel", "L", "laravel"], ["PHP", "PHP", "laravel"],
    ["ASP.NET", ".NET", "asp"], ["C#", "C#", "asp"], ["Python", "PY", "python"],
  ]],
  ["DevOps & Hosting", [
    ["Ubuntu Server", "UB", "ubuntu"], ["Vercel", "V", "hosting"],
    ["Render", "R", "hosting"], ["Hostinger", "H", "hosting"],
    ["DNS & HTTPS", "DNS", "hosting"],
  ]],
  ["Data & Growth", [
    ["Data Science with Python", "DS", "data"], ["Digital Marketing", "DM", "marketing"],
    ["SEO", "SEO", "marketing"],
  ]],
];

const cmsTitles = {
  wordpress: "WordPress & WooCommerce",
  mern: "MERN Stack Development",
  flutter: "Flutter App Development",
  laravel: "Laravel & PHP",
  asp: "ASP.NET & C#",
  python: "Python Automation & Backend Development",
  ubuntu: "DevOps & Ubuntu Server Setup",
  data: "Data Science with Python",
  marketing: "Digital Marketing & SEO",
  hosting: "Website Deployment, Hosting & Domain Setup",
};

const tileIcons = {
  React: <><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /><circle cx="12" cy="12" r=".8" fill="currentColor" /></>,
  MongoDB: <path d="M12 2c2 4 6 7.5 6 12a6 6 0 0 1-12 0c0-4.5 4-8 6-12Zm0 9v11" />,
  Flutter: <path d="M15 3h5L9 14l-2.5-2.5L15 3Zm0 9h5l-6 6 3 3h-4.5L9 17.5 15 12Z" />,
  Vercel: <path d="m12 4 9 16H3L12 4Z" fill="currentColor" stroke="none" />,
  OpenCart: <><path d="M3 5h2l2.5 10h10l2.5-7H6" /><circle cx="9" cy="19" r="1" /><circle cx="16" cy="19" r="1" /></>,
  "REST APIs": <path d="M8 6 3 12l5 6m8-12 5 6-5 6m-2-14-4 16" />,
  SEO: <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5m-12-9 2 2 3-4" /></>,
};

export function Skillset({ skills, aboutDescription, subtitle }) {
  const section = useRef(null);
  const descriptionId = useId();
  useSectionReveal(section);

  const records = new Map(
    skills.filter(({ group }) => group === "skills").map(({ title, description }) => [
      title.trim().toLowerCase(), description,
    ]),
  );
  const descriptions = Object.fromEntries(
    Object.entries(cmsTitles).map(([key, title]) => [key, records.get(title.toLowerCase())]),
  );
  descriptions.opencart = aboutDescription?.match(/[^.!?]*\bOpenCart\b[^.!?]*[.!?]?/i)?.[0].trim()
    || "I have managed product catalogs in OpenCart.";

  const tiles = categories.flatMap(([category, technologies]) =>
    technologies.map(([name, monogram, descriptionKey]) => ({
      category, name, monogram, description: descriptions[descriptionKey], descriptionKey,
    })),
  );

  return (
    <div ref={section} className="skillset-showcase">
      <header className="showcase-heading">
        <p className="eyebrow skillset-eyebrow" data-section-enter="heading">CRAFT / PERSPECTIVE</p>
        <h2 data-section-enter="heading" style={{ "--entry-delay": "75ms" }}>My Skillset</h2>
        <p className="showcase-subtitle" data-section-enter="heading" style={{ "--entry-delay": "150ms" }}>
          {subtitle || "The languages, frameworks, platforms, and tools I use to build and ship products."}
        </p>
      </header>
      <ul className="skillset-tiles" role="list">
        {tiles.map(({ category, name, monogram, description, descriptionKey }, index) => (
          <li key={name} data-section-enter="tile" style={{ "--entry-delay": `${(index * 137 + 71) % 401}ms` }}>
            <div
              className="skillset-tile"
              tabIndex={0}
              title={description}
              aria-labelledby={`${descriptionId}-skill-${index}`}
              aria-describedby={description ? `${descriptionId}-${descriptionKey}` : undefined}
            >
              <span className="skillset-icon" aria-hidden="true">
                {tileIcons[name] ? (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {tileIcons[name]}
                  </svg>
                ) : <span>{monogram}</span>}
              </span>
              <strong id={`${descriptionId}-skill-${index}`}>{name}</strong>
              <span className="skillset-category">{category}</span>
              <span className="skillset-accent" aria-hidden="true" />
            </div>
          </li>
        ))}
      </ul>
      {Object.entries(descriptions).map(([key, description]) =>
        description && <span className="showcase-sr-only" key={key} id={`${descriptionId}-${key}`}>{description}</span>,
      )}
    </div>
  );
}
