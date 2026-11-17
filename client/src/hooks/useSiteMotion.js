import { useEffect } from "react";

const revealTargets = [
  ".home-motion-section .section-title :is(.eyebrow, h2)",
  ".home-motion-section .section-title > .text-link",
  ".home-motion-section .about-preview > .hanging-photo",
  ".home-motion-section .about-preview > :last-child > :is(.eyebrow, h2, p, .button)",
  ".home-motion-section :is(.grid, .process-grid) > .card",
  ".home-motion-section > :is(.section-description, .empty, .muted)",
  ".site-main .contact-grid > .contact-form",
  ".site-main .contact-grid > :first-child > :is(.eyebrow, h1, h2, p, .contact-details)",
  ".footer > *",
].join(", ");

const motionProperties = [
  "--hero-scroll", "--hero-blur", "--hero-copy-y", "--hero-portrait-y",
  "--timeline-progress",
];

const clamp = (value) => Math.max(0, Math.min(1, value));

export function useSiteMotion() {
  useEffect(() => {
    const header = document.querySelector(".header");
    const hero = document.querySelector(".hero-section");
    const timeline = document.querySelector("#process .process-grid");
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const targets = [...document.querySelectorAll(revealTargets)];
    const steps = timeline ? [...timeline.querySelectorAll(":scope > .card")] : [];
    let frame = 0;
    let previousY = Math.max(0, window.scrollY);
    let directionDistance = 0;
    let measure = true;
    let heroEnd = 0;
    let headerHeight = 78;
    let timelineTop = 0;
    let timelineHeight = 0;
    let stepThresholds = [];
    let lastTimelineProgress;

    const observer = typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.dataset.reveal = "shown";
            observer.unobserve(entry.target);
          }
        })
      : null;

    if (observer) {
      const viewport = window.innerHeight;
      for (const target of targets) {
        if (target.getBoundingClientRect().top < viewport) continue;
        target.dataset.reveal = "pending";
        observer.observe(target);
      }
    }

    function update() {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const height = window.innerHeight;
      const resized = measure;
      if (resized) {
        headerHeight = header?.offsetHeight || 78;
        measure = false;
        if (hero) heroEnd = hero.offsetHeight;
        if (timeline) {
          const vertical = window.innerWidth <= 760;
          const axisLength = vertical ? timeline.offsetHeight : timeline.offsetWidth;
          stepThresholds = steps.map((step) => clamp(
            (vertical ? step.offsetTop + 37 : step.offsetLeft + 34) / Math.max(axisLength, 1),
          ));
          lastTimelineProgress = undefined;
          timelineTop = timeline.getBoundingClientRect().top + y;
          timelineHeight = timeline.offsetHeight;
        }
      }

      if (header) {
        header.toggleAttribute("data-scrolled", y > 8);
        const delta = y - previousY;
        if (delta) {
          directionDistance = Math.sign(delta) === Math.sign(directionDistance)
            ? directionDistance + delta : delta;
        }
        if (preference.matches || y <= headerHeight || directionDistance < -12) {
          header.removeAttribute("data-scroll-hidden");
        } else if (directionDistance > 16) {
          header.setAttribute("data-scroll-hidden", "");
        }
      }

      const reduced = preference.matches;
      if (hero && (resized || y < heroEnd || previousY < heroEnd)) {
        const progress = reduced ? 0 : clamp(y / Math.max(heroEnd * 0.85, 1));
        hero.style.setProperty("--hero-scroll", 1 - progress * 0.84);
        hero.style.setProperty("--hero-blur", `${progress * 4}px`);
        hero.style.setProperty("--hero-copy-y", `${progress * -42}px`);
        hero.style.setProperty("--hero-portrait-y", `${progress * -27}px`);
      }

      if (timeline) {
        const progress = reduced ? 1 : clamp(
          (height * 0.88 - (timelineTop - y)) / (timelineHeight * 0.7 + height * 0.16),
        );
        if (progress !== lastTimelineProgress) {
          lastTimelineProgress = progress;
          timeline.style.setProperty("--timeline-progress", progress);
          steps.forEach((step, index) => {
            step.toggleAttribute("data-step-reached", progress >= stepThresholds[index]);
          });
        }
      }

      previousY = y;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function resize() {
      measure = true;
      schedule();
    }

    const sizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver(resize)
      : null;
    document.querySelectorAll(".home-motion-section").forEach((section) => {
      sizeObserver?.observe(section);
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    preference.addEventListener("change", resize);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      sizeObserver?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      preference.removeEventListener("change", resize);
      header?.removeAttribute("data-scrolled");
      header?.removeAttribute("data-scroll-hidden");
      for (const target of targets) target.removeAttribute("data-reveal");
      for (const step of steps) step.removeAttribute("data-step-reached");
      for (const property of motionProperties) {
        hero?.style.removeProperty(property);
        timeline?.style.removeProperty(property);
      }
    };
  }, []);
}
