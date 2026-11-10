import React from "react";
import { Blocks } from "../components/content/ContentBlocks.jsx";
import { Role } from "../components/home/RotatingRole.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { mediaUrl } from "../utils/media.js";
import { Monitor } from "../components/home/HeroMonitor.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { selectFeatured } from "../utils/featured.js";
import { CardGrid } from "../components/content/CardGrid.jsx";
import { ContactSection } from "../components/contact/ContactSection.jsx";

export function Home({ data }) {
  const s = data.settings;
  const sections = data.sections;
  return (
    <>
      {sections.map((section) => {
        const common = section.content?.length ? (
          <Blocks blocks={section.content} data={data} />
        ) : null;
        let view;
        const heading =
          section.heading && section.heading !== section.key
            ? section.heading
            : null;
        switch (section.key) {
          case "hero":
            view = (
              <div className="hero">
                <div>
                  <p className="eyebrow availability">
                    <span className="dot" />
                    {s.availability ||
                      "DEVELOPMENT · DESIGN · ENTREPRENEURSHIP"}
                  </p>
                  <h1>
                    Hi, I’m {s.name || "Abdul Samad"},<br />
                    <Role roles={s.roles || []} />
                  </h1>
                  <p className="hero-description">
                    {s.heroDescription ||
                      "I turn ideas into thoughtful websites and digital products, combining development, design and a founder’s perspective."}
                  </p>
                  <div className="actions">
                    <a className="button" href="/projects">
                      View My Work <Icon />
                    </a>
                    <a className="button outline" href="/contact">
                      Contact Me
                    </a>
                    {s.resumeId && (
                      <a className="text-link" href={mediaUrl(s.resumeId)}>
                        ↓ View Resume
                      </a>
                    )}
                  </div>
                  <div className="hero-social">
                    {s.socialLinks
                      ?.filter((l) => l.visible && l.url)
                      .map((l) => (
                        <a
                          key={l.platform}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {l.platform} ↗
                        </a>
                      ))}
                  </div>
                </div>
                <Monitor settings={s} />
              </div>
            );
            break;
          case "ventures":
            view = (
              <>
                <SectionTitle
                  label="FOUNDER / BUILDER"
                  title={
                    section.heading === "ventures"
                      ? "Ventures & Companies"
                      : section.heading || "Ventures & Companies"
                  }
                  action={["All Ventures", "/ventures"]}
                />
                <CardGrid
                  collection="ventures"
                  items={selectFeatured(
                    data.items.ventures,
                    section.featuredVentureIds,
                  ).slice(0, 3)}
                  empty="Bibros Solutions · DUSSU Store · Bol Hi — venture stories will be shared here."
                />
              </>
            );
            break;
          case "about":
            view = (
              <div className="about-preview">
                <div className="hanging-photo">
                  <img
                    loading="lazy"
                    src={
                      mediaUrl(s.profileImageId) || "/assets/abdul-samad.png"
                    }
                    alt="Abdul Samad"
                  />
                  <span>ABDUL SAMAD / KARACHI</span>
                </div>
                <div>
                  <p className="eyebrow">ABOUT / STORY</p>
                  <h2>
                    {heading || "Hello!"}
                    <br />
                    I’m {s.name || "Abdul Samad"}.<br />
                    <span className="orange">I build ideas for the web.</span>
                  </h2>
                  <p>
                    {s.aboutDescription ||
                      "My work brings together web development, design and entrepreneurship. I care about clear experiences, useful features and the business behind each product."}
                  </p>
                  <a className="button" href="/about">
                    Get to know me <Icon />
                  </a>
                </div>
              </div>
            );
            break;
          case "services":
            view = (
              <>
                <SectionTitle
                  label="CAPABILITIES / SERVICES"
                  title={
                    section.heading === "services"
                      ? "Core Services Offered"
                      : section.heading || "Core Services Offered"
                  }
                  action={["All Services", "/services"]}
                />
                <div className="grid">
                  {selectFeatured(
                    data.items.services,
                    section.featuredServiceIds,
                  ).map((v, i) => (
                    <a
                      href={"/services/" + v.slug}
                      className="card service-card"
                      key={v._id}
                    >
                      <span className="service-icon">
                        {["W", "⌘", "✧"][i % 3]}
                      </span>
                      <h3>{v.title}</h3>
                      <p>{v.summary}</p>
                      <span className="text-link">Explore service ↗</span>
                    </a>
                  ))}
                </div>
              </>
            );
            break;
          case "skills":
          case "process":
          case "beyond-code": {
            const group = {
              skills: "skills",
              process: "process",
              "beyond-code": "beyond_code",
            }[section.key];
            const list = data.skills.filter((x) => x.group === group);
            view = (
              <>
                <SectionTitle
                  label="CRAFT / PERSPECTIVE"
                  title={
                    heading ||
                    {
                      skills: "My Skillset",
                      process: "How I Work",
                      "beyond-code": "Beyond Code: Vision & Execution",
                    }[section.key]
                  }
                />
                {list.length ? (
                  <div
                    className={
                      "grid " +
                      (group === "skills" ? "skills-grid" : "process-grid")
                    }
                  >
                    {list.map((v, i) => (
                      <div className="card compact" key={v._id}>
                        <span className="eyebrow orange">
                          {v.iconKey || String(i + 1).padStart(2, "0")}
                        </span>
                        <h3>{v.title}</h3>
                        <p>{v.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">
                    More about my craft and journey, coming soon.
                  </p>
                )}
              </>
            );
            break;
          }
          case "projects":
            view = (
              <>
                <SectionTitle
                  label="SELECTED / WORK"
                  title={heading || "Featured Projects"}
                  action={["All Projects", "/projects"]}
                />
                <CardGrid
                  collection="projects"
                  items={selectFeatured(
                    data.items.projects,
                    section.featuredProjectIds,
                  ).slice(0, 3)}
                />
              </>
            );
            break;
          case "articles":
            view = (
              <>
                <SectionTitle
                  label="THOUGHTS / FIELD NOTES"
                  title={heading || "Latest Articles"}
                  action={["All Articles", "/blog"]}
                />
                <CardGrid
                  collection="blog_posts"
                  items={selectFeatured(
                    data.items.blog_posts,
                    section.featuredPostIds,
                  ).slice(0, 3)}
                  empty="Notes on development, design and building businesses are on the way."
                />
              </>
            );
            break;
          case "contact":
            view = <ContactSection data={data} title={heading} />;
            break;
          default:
            view = (
              <>
                <SectionTitle label="EXPLORE" title={section.heading || ""} />
              </>
            );
        }
        return (
          <section
            key={section.key}
            className={
              "section " + (section.key === "hero" ? "hero-section" : "")
            }
            id={section.key}
          >
            {view}
            {section.description && (
              <p className="section-description">{section.description}</p>
            )}
            {common}
          </section>
        );
      })}
    </>
  );
}
