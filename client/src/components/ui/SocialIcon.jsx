import React from "react";

const marks = {
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
  whatsapp: <><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L4 20.4l1.1-3.8a8.5 8.5 0 1 1 15.4-4.8Z" /><path d="m9 8-1 1c0 3 3 6 6 7l1.5-1.5-2.6-1.4-1.1.9c-1.3-.7-2.2-1.6-2.7-2.8l.8-1.1L9 8Z" /></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v6m0-9h.01M12 16v-6m0 3a2 2 0 0 1 4 0v3" /></>,
  github: <><path d="M8.5 20c-1 .3-2.4-.3-2.9-1.4-.3-.7-.7-1.2-1.4-1.4M9 21v-2.5c0-.9.3-1.4.7-1.8-3.5-.4-4.7-2.1-4.7-4.7 0-1.4.5-2.4 1.2-3.2-.3-.8-.3-2 .2-3.1 1.3 0 2.6.8 3.2 1.2a9 9 0 0 1 4.8 0c.6-.4 1.9-1.2 3.2-1.2.5 1.1.5 2.3.2 3.1.7.8 1.2 1.8 1.2 3.2 0 2.6-1.2 4.3-4.7 4.7.4.4.7.9.7 1.8V21" /></>,
  facebook: <path d="M14 21v-8h3l.5-4H14V7.4c0-1 .4-1.4 1.5-1.4H18V3h-3c-3 0-5 1.6-5 4.5V9H7v4h3v8" />,
  tiktok: <path d="M14 4v11a4 4 0 1 1-4-4m4-7a5 5 0 0 0 5 5" />,
  youtube: <><rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10 9 5 3-5 3Z" /></>,
  x: <path d="m4 4 12 16h4L8 4ZM20 4 4 20" />,
  discord: <><path d="M7 6 4 8l-2 8 5 2 1-2m9-10 3 2 2 8-5 2-1-2M7 6l2 1h6l2-1M7 15c3 2 7 2 10 0" /><path d="M9 12h.01M15 12h.01" /></>,
};

export function SocialIcon({ platform }) {
  const key = platform.trim().toLowerCase().replace("twitter", "x");
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {marks[key] || <path d="M7 17 17 7M7 7h10v10" />}
    </svg>
  );
}
