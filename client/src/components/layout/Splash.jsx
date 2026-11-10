import React, { useEffect, useState } from "react";

export function Splash({ settings }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const s = settings.splash;
    if (!s?.enabled || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    try {
      if (s.oncePerSession && sessionStorage.getItem("samad-intro")) return;
      sessionStorage.setItem("samad-intro", "1");
    } catch {}
    setShow(true);
    const t = setTimeout(
      () => setShow(false),
      Math.min(3000, Math.max(0, s.durationMs ?? 1200)),
    );
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div
      className={
        "splash " +
        (settings.splash.animationEnabled === false ? "no-animation" : "")
      }
      aria-hidden="true"
    >
      <strong>
        {(settings.splash.wordmark || "ABDUL SAMAD.").replace(/\.$/, "")}
        <span className="orange">.</span>
      </strong>
      <p className="eyebrow">{settings.splash.subtitle}</p>
      <div className="progress" />
    </div>
  );
}
