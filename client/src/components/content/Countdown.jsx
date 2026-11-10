import React, { useEffect, useState } from "react";

export function Countdown({ date }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="badge">
      {now && new Date(date) > now
        ? `${Math.ceil((new Date(date) - now) / 86400000)} days to launch`
        : `Launch: ${new Date(date).toISOString().slice(0, 10)}`}
    </p>
  );
}
