import React, { useEffect, useState } from "react";

export function Role({ roles }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (
      roles.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = setInterval(() => setI((v) => (v + 1) % roles.length), 3200);
    return () => clearInterval(t);
  }, [roles.length]);
  return (
    <span className="role">
      {roles[i] || "Web Developer"}
      <span className="cursor" />
    </span>
  );
}
