import React, { useEffect, useRef } from "react";
import { useSectionReveal } from "./useSectionReveal.js";

const chapters = [
  {
    label: "Founder", title: "Bibros Solutions",
    description: "I founded Bibros Solutions, my web design and development agency. I build WordPress sites, online stores, and custom web applications for businesses.",
    tags: ["Web Design", "Development", "E-commerce"], glyph: "M12 4 3 9l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17l9 5 9-5",
  },
  {
    label: "Brand", title: "DUSSU Store",
    description: "I founded DUSSU Store, a Karachi streetwear brand built around “Wear Your Difference.” I also built its MERN storefront, including collection browsing and cash-on-delivery checkout.",
    tags: ["Streetwear", "Karachi", "MERN"], glyph: "M8 4c1 2 2 3 4 3s3-1 4-3l5 3-2 5-3-1v9H8v-9l-3 1-2-5 5-3Z",
  },
  {
    label: "Work", title: "Web Developer",
    description: "I build business websites and online stores with WordPress and WooCommerce. My client projects include a WordPress site for Naveed & Umer Builders and a custom MERN storefront for Farmeri.",
    tags: ["WordPress", "WooCommerce", "MERN"], glyph: "M8 7 3 12l5 5m8-10 5 5-5 5m-2-13-4 16",
  },
  {
    label: "Mobile", title: "Flutter Development",
    description: "I build cross-platform mobile interfaces for Android and iOS with Flutter and Dart, including navigation, forms, and API integration.",
    tags: ["Flutter", "Android", "iOS"], glyph: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 14h2",
  },
  {
    label: "Next", title: "Building Bol Hi",
    description: "I’m building Bol Hi, an upcoming messaging app designed to make everyday conversations easier.",
    tags: ["Messaging", "Coming Soon"], glyph: "m3 11 18-7-7 17-3-7-8-3Zm8 3L21 4",
  },
];

const chapterNumber = (index) => String(index + 1).padStart(2, "0");
const total = chapterNumber(chapters.length - 1);
const clamp = (value) => Math.max(0, Math.min(1, value));

function useJourneyMotion(deckRef, counterRef) {
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const wide = matchMedia("(min-width: 761px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)");
    const cards = [...deck.querySelectorAll(".journey-layer")];
    let inRange = typeof IntersectionObserver !== "function";
    let frame = 0;
    let lastActive = -1;
    let pin = 0;

    function draw() {
      frame = 0;
      if (!wide.matches || !inRange) return;

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
      if (!wide.matches) return;
      pin = Number.parseFloat(getComputedStyle(cards[0]).top) || 0;
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
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
      for (const card of cards) {
        for (const prop of ["--journey-enter", "--journey-leave", "--journey-twist"]) {
          card.style.removeProperty(prop);
        }
      }
    };
  }, [deckRef, counterRef]);
}

export function BeyondCode({ subtitle }) {
  const root = useRef(null);
  const deck = useRef(null);
  const counter = useRef(null);
  useSectionReveal(root);
  useJourneyMotion(deck, counter);

  return (
    <div ref={root} className="journey-showcase">
      <header className="showcase-heading">
        <p className="eyebrow" data-section-enter="heading">MY JOURNEY</p>
        <h2 data-section-enter="heading" style={{ "--entry-delay": "75ms" }}>Beyond Code</h2>
        <p className="showcase-subtitle" data-section-enter="heading" style={{ "--entry-delay": "150ms" }}>
          {subtitle || "The businesses, client projects, and apps I’m building."}
        </p>
      </header>
      <div ref={deck} className="journey-deck">
        <div className="journey-side" aria-hidden="true">
          <div><strong ref={counter}>01</strong> / {total}<span>JOURNEY</span></div>
        </div>
        <ol className="journey-chapters" role="list">
          {chapters.map(({ label, title, description, tags, glyph }, index) => {
            const number = chapterNumber(index);
            return (
              <li className="journey-layer" key={title}>
                <article className="journey-card" data-section-enter="chapter">
                  <span className="journey-label">{label}</span>
                  <div className="journey-copy">
                    <p className="journey-count" aria-hidden="true"><strong>{number}</strong> / {total}</p>
                    <p className="journey-kicker">CHAPTER {number}</p>
                    <h3>{title}</h3>
                    <p className="journey-description">{description}</p>
                    <ul className="journey-tags" role="list">
                      {tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  </div>
                  <span className="journey-glyph" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="58" height="58" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
                      <path d={glyph} />
                    </svg>
                  </span>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
