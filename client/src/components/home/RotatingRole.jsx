import React, { useEffect, useState } from "react";

export function Role({ roles }) {
  const firstRole = roles[0] || "Web Developer";
  const [text, setText] = useState(firstRole);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setText(firstRole);
    if (roles.length < 2) return;

    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const letters = roles.map((role) => Array.from(role));
    let timer;

    function start() {
      clearTimeout(timer);
      setText(firstRole);
      setVersion(0);
      if (preference.matches) return;

      let roleIndex = 0;
      let length = letters[0].length;
      let deleting = true;

      function tick() {
        const word = letters[roleIndex];
        if (length === 0 && !deleting) setVersion((previous) => previous + 1);
        length += deleting ? -1 : 1;
        setText(word.slice(0, length).join(""));

        if (length === 0 && deleting) {
          roleIndex = (roleIndex + 1) % letters.length;
          deleting = false;
          timer = setTimeout(tick, 230);
        } else if (length >= word.length && !deleting) {
          deleting = true;
          timer = setTimeout(tick, 1650);
        } else {
          timer = setTimeout(tick, deleting ? 32 : 65);
        }
      }

      timer = setTimeout(tick, 2100);
    }

    start();
    preference.addEventListener("change", start);
    return () => {
      clearTimeout(timer);
      preference.removeEventListener("change", start);
    };
  }, [firstRole, roles]);

  return (
    <span className="role motion-role">
      {(roles.length ? roles : [firstRole]).map((role, index) => (
        <span className="role-measure" aria-hidden="true" key={index}>
          {role}<span className="cursor" />
        </span>
      ))}
      <span className="role-accessible">{firstRole}</span>
      <span className="role-typed" aria-hidden="true">
        <span key={version} className={version ? "role-word role-word-enter" : "role-word"}>{text}</span>
        <span className="cursor" />
      </span>
    </span>
  );
}
