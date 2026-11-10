import React from "react";

export function Icon({ name }) {
  const shapes = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    projects: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M8 5V3h8v2M3 11h18" />
      </>
    ),
    ventures: (
      <>
        <path d="m12 3 8 5v9l-8 4-8-4V8Z" />
        <path d="m4 8 8 5 8-5M12 13v8" />
      </>
    ),
    blog: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {shapes[name] || shapes.arrow}
    </svg>
  );
}
