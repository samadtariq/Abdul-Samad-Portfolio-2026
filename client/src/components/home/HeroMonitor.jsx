import React from "react";
import { mediaUrl } from "../../utils/media.js";

export function Monitor({ settings }) {
  const src = mediaUrl(settings.profileImageId) || "/assets/abdul-samad.png";
  return (
    <div className="monitor-wrap">
      <div className="monitor">
        <div className="monitor-top">
          <span>● SAMAD.STUDIO</span>
          <span>PORTFOLIO — 01</span>
        </div>
        <div className="monitor-screen">
          {settings.heroMediaType === "video" && settings.heroVideoId ? (
            <video
              controls
              preload="metadata"
              poster={src}
              src={mediaUrl(settings.heroVideoId)}
            />
          ) : (
            <img
              src={src}
              alt={`Professional portrait of ${settings.name || "Abdul Samad"}`}
              style={{
                objectPosition: settings.heroPortraitPosition || "center 30%",
              }}
              fetchPriority="high"
            />
          )}
          <span className="monitor-caption">
            DEVELOPER / DESIGNER / FOUNDER
          </span>
        </div>
        <div className="monitor-bottom">
          <i />
          <span>IDEAS INTO REALITY</span>
          <b>◉</b>
        </div>
      </div>
      <div className="monitor-stand" />
    </div>
  );
}
