import React, { useEffect, useState } from "react";
import { api } from "../../services/adminApi.js";
import { settingsViews } from "../config/fields.js";
import { Editor } from "../components/ContentEditor.jsx";

export function Singleton({ view, defs, options }) {
  const [state, setState] = useState(null),
    [error, setError] = useState("");
  const collection = ["about", "privacy"].includes(view)
    ? "pages"
    : "portfolio_settings";
  useEffect(() => {
    api("/api/admin/" + collection)
      .then((v) => {
        const d = v.items.find((x) =>
          collection === "pages" ? x.key === view : x.key === "main",
        );
        if (!d)
          throw new Error("Default record missing. Run database migrations.");
        setState(d);
      })
      .catch((e) => setError(e.message));
  }, [view]);
  if (!state)
    return (
      <p className={error ? "error" : ""}>{error || "Loading settings…"}</p>
    );
  return (
    <Editor
      key={view}
      collection={collection}
      id={state._id}
      initial={state}
      definition={defs[collection]}
      options={options}
      fields={
        settingsViews[view] || [
          "title",
          "content",
          "timeline",
          "portraitId",
          "lastReviewedAt",
          "publicationStatus",
          "seo",
        ]
      }
    />
  );
}
