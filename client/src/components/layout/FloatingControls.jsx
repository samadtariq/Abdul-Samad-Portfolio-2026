import React, { useState } from "react";
import { selectFeatured } from "../../utils/featured.js";
import { Modal } from "../ui/Modal.jsx";
import { CardGrid } from "../content/CardGrid.jsx";

export function Floating({ data }) {
  const [open, setOpen] = useState(false);
  const f = data.settings.floatingControls || {},
    allowed = f.platforms || [];
  const socials = (
    data.settings.socialLinks?.filter(
      (x) => x.visible && x.url && allowed.includes(x.platform),
    ) || []
  ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const teasers = selectFeatured(data.items.teasers, f.featuredTeaserIds).slice(
    0,
    4,
  );
  const icons = {
    whatsapp: "WA",
    instagram: "IG",
    linkedin: "in",
    facebook: "f",
  };
  let controls = [
    ...(f.enabled
      ? socials.map((v) => ({
          key: v.platform,
          node: (
            <a
              className={"social-float " + v.platform}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={v.platform}
              title={v.platform}
            >
              {icons[v.platform]}
            </a>
          ),
        }))
      : []),
    ...(f.comingSoonEnabled && teasers.length
      ? [
          {
            key: "coming-soon",
            node: (
              <button
                className={
                  "button small " + (f.animationEnabled ? "bounce" : "")
                }
                onClick={() => setOpen(true)}
              >
                {f.comingSoonLabel || "Coming Soon 👀"}
              </button>
            ),
          },
        ]
      : []),
  ];
  const order = f.displayOrder || [];
  if (order.length)
    controls.sort(
      (a, b) =>
        (order.includes(a.key) ? order.indexOf(a.key) : 99) -
        (order.includes(b.key) ? order.indexOf(b.key) : 99),
    );
  return (
    <>
      <div className="floating">
        {controls.map((x) => (
          <React.Fragment key={x.key}>{x.node}</React.Fragment>
        ))}
      </div>
      {open && (
        <Modal title="Something big is coming" onClose={() => setOpen(false)}>
          <CardGrid collection="teasers" items={teasers} />
        </Modal>
      )}
    </>
  );
}
