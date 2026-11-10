import React, { useEffect, useRef } from "react";

export function Modal({ title, onClose, children }) {
  const box = useRef();
  useEffect(() => {
    const before = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    box.current?.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = box.current.querySelectorAll(
          'button,a,input,select,textarea,[tabindex="0"]',
        );
        if (!nodes.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === box.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === box.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex="-1"
        ref={box}
      >
        <button className="close" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}
