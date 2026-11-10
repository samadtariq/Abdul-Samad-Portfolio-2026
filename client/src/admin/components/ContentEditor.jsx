import React, { useEffect, useState, useRef } from "react";
import { empty, normalize, label } from "../config/fields.js";
import { api } from "../../services/adminApi.js";
import { Field } from "./FormField.jsx";
import { ValidationContext } from "./ValidationContext.jsx";

export function Editor({
  collection,
  id,
  definition,
  options,
  fields,
  onSaved,
  initial,
}) {
  const [doc, setDoc] = useState(initial || null),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false),
    [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const formRef = useRef(null);
  useEffect(() => {
    const first = Object.keys(fieldErrors)[0];
    if (!first) return;
    const input = [
      ...(formRef.current?.querySelectorAll("[data-field-path]") || []),
    ].find((x) => x.dataset.fieldPath === first);
    if (input) {
      input.focus({ preventScroll: true });
      input.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [fieldErrors]);
  const isNew = id === "new";
  const dirtyRef = useRef(false);
  useEffect(() => {
    if (initial) {
      setDoc(initial);
      return;
    }
    if (isNew) {
      const d = {};
      for (const [k, s] of Object.entries(
        definition.validator.$jsonSchema.properties,
      ))
        if (
          !["_id", "createdAt", "updatedAt"].includes(k) &&
          definition.validator.$jsonSchema.required?.includes(k)
        )
          d[k] = empty(s);
      if (collection === "blog_posts") d.authorId = options.admins?.[0]?._id;
      setDoc(d);
    } else
      api(`/api/admin/${collection}/${id}`)
        .then(setDoc)
        .catch((e) => setMessage(e.message));
  }, [id, collection]);
  useEffect(() => {
    const fn = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);
  if (!doc) return <p>{message || "Loading editor…"}</p>;
  const schema = definition.validator.$jsonSchema;
  const skip = [
    "_id",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "readingTimeMinutes",
    "uploadedBy",
  ];
  const pageKeys =
    collection === "pages"
      ? doc.key === "home"
        ? ["title", "publicationStatus", "seo"]
        : doc.key === "about"
          ? [
              "title",
              "content",
              "portraitId",
              "timeline",
              "publicationStatus",
              "seo",
            ]
          : doc.key === "privacy"
            ? ["title", "content", "lastReviewedAt", "publicationStatus", "seo"]
            : ["title", "content", "publicationStatus", "seo"]
      : null;
  const keys =
    fields ||
    pageKeys ||
    Object.keys(schema.properties).filter(
      (k) =>
        !skip.includes(k) &&
        !(collection === "pages" && ["key", "slug"].includes(k)),
    );
  const previewPrefix = {
    projects: "projects",
    ventures: "ventures",
    teasers: "coming-soon",
    services: "services",
    blog_posts: "blog",
  }[collection];
  const preview = previewPrefix
    ? `/${previewPrefix}/${doc.slug}?preview=${collection}:${doc._id}`
    : collection === "pages"
      ? `${doc.key === "home" ? "/" : "/" + doc.key}?preview=pages:${doc._id}`
      : null;
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setFieldErrors({});
    try {
      const payload = Object.fromEntries(
        Object.entries(doc).filter(
          ([k]) =>
            ![
              "_id",
              "createdAt",
              "updatedAt",
              "publishedAt",
              "readingTimeMinutes",
            ].includes(k),
        ),
      );
      const send =
        collection === "media"
          ? { alt: doc.alt || "", caption: doc.caption || "" }
          : collection === "inquiries"
            ? { status: doc.status }
            : payload;
      const out = await api(
        `/api/admin/${collection}${isNew ? "" : "/" + doc._id}`,
        {
          method: isNew ? "POST" : "PUT",
          body: JSON.stringify(normalize(send)),
        },
      );
      setDoc(out);
      dirtyRef.current = false;
      setDirty(false);
      setMessage("Saved successfully.");
      if (isNew) window.location.assign(`/admin/${collection}/${out._id}`);
      onSaved?.(out);
    } catch (e) {
      setFieldErrors(e.fieldErrors || {});
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <ValidationContext.Provider value={fieldErrors}>
      <form ref={formRef} className="editor-form" onSubmit={save}>
        <div className="editor-toolbar">
          <div>
            <span className="eyebrow">
              {isNew
                ? "NEW RECORD"
                : dirty
                  ? "UNSAVED CHANGES"
                  : "CONTENT EDITOR"}
            </span>
            <h1>{label(collection)}</h1>
          </div>
          <div className="actions">
            {preview && !isNew && (
              <a
                className="button outline small"
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview Saved ↗
              </a>
            )}
            <button className="button small" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
        {message && (
          <p
            role="status"
            className={message === "Saved successfully." ? "success" : "error"}
          >
            {message}
          </p>
        )}
        <div className="card editor-fields">
          {collection === "projects" && !doc.content?.length && (
            <button
              type="button"
              className="button outline small"
              onClick={() => {
                setDoc({
                  ...doc,
                  content: [
                    "Overview",
                    "Challenge",
                    "Approach",
                    "Features",
                  ].map((text) => ({ type: "heading", level: 2, text })),
                });
                dirtyRef.current = true;
                setDirty(true);
              }}
            >
              Add case study headings
            </button>
          )}
          {collection === "inquiries" && (
            <div className="inquiry-message">
              <h2>{doc.name}</h2>
              <a href={"mailto:" + doc.email}>{doc.email}</a>
              <p>
                {doc.serviceInterest} {doc.budget}
              </p>
              <p className="preserve">{doc.message}</p>
            </div>
          )}
          {keys
            .filter((k) => schema.properties[k])
            .map((k) => (
              <Field
                name={k}
                key={k}
                spec={schema.properties[k]}
                value={doc[k]}
                parent={doc}
                options={options}
                required={schema.required?.includes(k)}
                onChange={(v) => {
                  setDoc({ ...doc, [k]: v });
                  dirtyRef.current = true;
                  setDirty(true);
                }}
              />
            ))}
        </div>
        <button className="button" disabled={saving}>
          Save Changes
        </button>
      </form>
    </ValidationContext.Provider>
  );
}
