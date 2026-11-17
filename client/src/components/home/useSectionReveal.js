import { useEffect } from "react";

export function useSectionReveal(root) {
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver !== "function") return;

    const entries = [...root.current.querySelectorAll("[data-section-enter]")];
    const observer = new IntersectionObserver((changes) => {
      for (const { isIntersecting, target } of changes) {
        if (!isIntersecting) continue;
        target.dataset.sectionVisibility = "shown";
        observer.unobserve(target);
      }
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });

    for (const entry of entries) {
      if (entry.getBoundingClientRect().top < window.innerHeight) continue;
      entry.dataset.sectionVisibility = "pending";
      observer.observe(entry);
    }

    return () => {
      observer.disconnect();
      for (const entry of entries) delete entry.dataset.sectionVisibility;
    };
  }, [root]);
}
