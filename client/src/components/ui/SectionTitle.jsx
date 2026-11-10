import React from "react";

export function SectionTitle({ label, title, action }) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow orange">{label}</p>
        <h2>{title}</h2>
      </div>
      {action && (
        <a className="text-link" href={action[1]}>
          {action[0]} ↗
        </a>
      )}
    </div>
  );
}
