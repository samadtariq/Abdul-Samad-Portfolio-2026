import React from "react";
import { mediaUrl } from "../utils/media.js";
import { Blocks } from "../components/content/ContentBlocks.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { CardGrid } from "../components/content/CardGrid.jsx";

export function About({ data, record }) {
  return (
    <section className="section">
      <p className="eyebrow orange">ABOUT / THE JOURNEY</p>
      <h1 className="page-title">
        {record?.title ||
          "Crafting thoughtful digital experiences, from Karachi to the world."}
      </h1>
      <div className="about-preview">
        <div className="hanging-photo">
          <img
            src={
              mediaUrl(record?.portraitId || data.settings.profileImageId) ||
              "/assets/abdul-samad.png"
            }
            alt="Abdul Samad"
          />
          <span>DEVELOPER & ENTREPRENEUR</span>
        </div>
        <div>
          <h2>{data.settings.name || "Abdul Samad"}</h2>
          <p className="lead">
            {data.settings.aboutDescription ||
              "I work across WordPress, web design and full-stack development, while building my own ventures."}
          </p>
          <Blocks blocks={record?.content} data={data} />
        </div>
      </div>
      {record?.timeline?.length > 0 && (
        <>
          <SectionTitle title="Chronology & Milestones" label="MY JOURNEY" />
          {record.timeline.map((v, i) => (
            <div className="card timeline" key={i}>
              <span className="eyebrow">
                {v.startLabel} — {v.endLabel}
              </span>
              <h3>{v.title}</h3>
              <p>{v.organization}</p>
              <p>{v.description}</p>
            </div>
          ))}
        </>
      )}
      {data.settings.stats?.some((s) => s.visible) && (
        <div className="grid">
          {data.settings.stats
            .filter((s) => s.visible)
            .map((s, i) => (
              <div className="card" key={i}>
                <h2>{s.value}</h2>
                <p>{s.label}</p>
              </div>
            ))}
        </div>
      )}
      <SectionTitle title="The Ventures Ecosystem" label="FOUNDER" />
      <CardGrid collection="ventures" items={data.items.ventures} />
    </section>
  );
}
