import React, { useEffect, useRef } from "react";
import { mediaUrl } from "../../utils/media.js";
import { useSectionReveal } from "./useSectionReveal.js";

const glyphs = {
  founder: "M12 4 3 9l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17l9 5 9-5",
  brand: "M8 4c1 2 2 3 4 3s3-1 4-3l5 3-2 5-3-1v9H8v-9l-3 1-2-5 5-3Z",
  work: "M8 7 3 12l5 5m8-10 5 5-5 5m-2-13-4 16",
  mobile: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 14h2",
  next: "m3 11 18-7-7 17-3-7-8-3Zm8 3L21 4",
  journey: "M5 20v-3a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
};

const chapterNumber = (index) => String(index + 1).padStart(2, "0");
const clamp = (value) => Math.max(0, Math.min(1, value));

function useJourneyMotion(deckRef, counterRef, chapterCount) {
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || chapterCount < 2) return;

    const wide = matchMedia("(min-width: 761px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)");
    const cards = [...deck.querySelectorAll(".journey-layer")];
    let inRange = typeof IntersectionObserver !== "function";
    let frame = 0;
    let lastActive = -1;
    let pin = 0;
    let measuredViewport = "";

    function draw() {
      frame = 0;
      if (!wide.matches || !inRange || deck.hasAttribute("data-journey-flat")) return;

      const tops = cards.map((card) => card.getBoundingClientRect().top);
      const approach = window.innerHeight * 0.56;
      let active = 0;
      for (let index = 0; index < cards.length; index++) {
        const entering = index ? clamp(1 - (tops[index] - pin) / approach) : 1;
        const leaving = index + 1 < cards.length
          ? clamp(1 - (tops[index + 1] - pin) / approach) : 0;
        if (entering >= 0.78) active = index;

        const style = cards[index].style;
        style.setProperty("--journey-enter", entering.toFixed(3));
        style.setProperty("--journey-leave", leaving.toFixed(3));
        style.setProperty("--journey-twist", `${((entering - leaving) * 22 - 11).toFixed(1)}deg`);
      }

      if (active !== lastActive) {
        lastActive = active;
        if (counterRef.current) counterRef.current.textContent = chapterNumber(active);
      }
    }

    function schedule() {
      if (wide.matches && inRange && !frame) frame = requestAnimationFrame(draw);
    }

    function measure() {
      if (!wide.matches) {
        deck.removeAttribute("data-journey-flat");
        measuredViewport = "";
        return;
      }
      const viewport = `${window.innerWidth}x${window.innerHeight}`;
      if (measuredViewport !== viewport) {
        measuredViewport = viewport;
        deck.removeAttribute("data-journey-flat");
      }
      pin = Number.parseFloat(getComputedStyle(cards[0]).top) || 0;
      if (cards.some((card) => card.offsetHeight > window.innerHeight - pin - 32)) {
        deck.setAttribute("data-journey-flat", "");
      }
      schedule();
    }

    const observer = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => {
          inRange = entry.isIntersecting;
          schedule();
        }, { rootMargin: "10% 0px" }) : null;
    observer?.observe(deck);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    wide.addEventListener("change", measure);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      deck.removeAttribute("data-journey-flat");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
      for (const card of cards) {
        for (const prop of ["--journey-enter", "--journey-leave", "--journey-twist"]) {
          card.style.removeProperty(prop);
        }
      }
    };
  }, [deckRef, counterRef, chapterCount]);
}

export function BeyondCode({ subtitle, chapters }) {
  const root = useRef(null);
  const deck = useRef(null);
  const counter = useRef(null);
  useSectionReveal(root);
  useJourneyMotion(deck, counter, chapters.length);
  const total = chapterNumber(chapters.length - 1);

  return (
    <div ref={root} className="journey-showcase">
      <header className="showcase-heading">
        <p className="eyebrow" data-section-enter="heading">MY JOURNEY</p>
        <h2 data-section-enter="heading" style={{ "--entry-delay": "75ms" }}>Beyond Code</h2>
        <p className="showcase-subtitle" data-section-enter="heading" style={{ "--entry-delay": "150ms" }}>
          {subtitle || "The businesses, client projects, and apps I’m building."}
        </p>
      </header>
      {chapters.length ? (
        <div ref={deck} className="journey-deck">
          {chapters.length > 1 && (
            <div className="journey-side" aria-hidden="true">
              <div><strong ref={counter}>01</strong> / {total}<span>JOURNEY</span></div>
            </div>
          )}
          <ol className="journey-chapters" role="list">
            {chapters.map(({ _id, title, description, category, iconKey, iconMediaId }, index) => {
              const number = chapterNumber(index);
              const icon = mediaUrl(iconMediaId);
              const glyphKey = iconKey?.trim().toLowerCase();
              const glyph = Object.hasOwn(glyphs, glyphKey) ? glyphs[glyphKey] : glyphs.journey;
              return (
                <li className="journey-layer" key={_id}>
                  <article className="journey-card" data-section-enter="chapter">
                    <span className="journey-label">{category || "Journey"}</span>
                    <div className="journey-copy">
                      <p className="journey-count" aria-hidden="true"><strong>{number}</strong> / {total}</p>
                      <p className="journey-kicker">CHAPTER {number}</p>
                      <h3>{title}</h3>
                      {description && <p className="journey-description">{description}</p>}
                    </div>
                    <span className="journey-glyph" aria-hidden="true">
                      {icon ? (
                        <img src={icon} alt="" width="64" height="64" loading="lazy" />
                      ) : (
                        <svg viewBox="0 0 24 24" width="58" height="58" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
                          <path d={glyph} />
                        </svg>
                      )}
                    </span>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
