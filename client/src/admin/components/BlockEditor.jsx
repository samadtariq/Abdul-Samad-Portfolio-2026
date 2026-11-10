import React, { useState, useContext } from "react";
import { ValidationContext } from "./ValidationContext.jsx";
import { label } from "../config/fields.js";
import { MediaPicker } from "./MediaPicker.jsx";

export function BlockEditor({ value, onChange, options, path = "content" }) {
  const errors = useContext(ValidationContext);
  const [type, setType] = useState("paragraph");
  const update = (i, key, v) =>
    onChange(value.map((b, j) => (j === i ? { ...b, [key]: v } : b)));
  return (
    <fieldset className="block-editor">
      <legend>Article / page content</legend>
      <p className="muted">
        Add and reorder text, images and videos. Content is rendered safely as
        structured blocks.
      </p>
      {value.map((b, i) => (
        <div className="array-item" key={i}>
          <div className="row">
            <b>
              {i + 1}. {label(b.type)}
            </b>
            <button
              type="button"
              className="mini"
              onClick={() => {
                if (i) {
                  const a = [...value];
                  [a[i - 1], a[i]] = [a[i], a[i - 1]];
                  onChange(a);
                }
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="mini"
              onClick={() => {
                if (i < value.length - 1) {
                  const a = [...value];
                  [a[i + 1], a[i]] = [a[i], a[i + 1]];
                  onChange(a);
                }
              }}
            >
              ↓
            </button>
            <button
              type="button"
              className="mini danger"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
          {["paragraph", "heading", "quote", "code", "link"].includes(
            b.type,
          ) && (
            <label>
              Text
              <textarea
                value={b.text || ""}
                rows={b.type === "code" ? 8 : 4}
                onChange={(e) => update(i, "text", e.target.value)}
              />
            </label>
          )}
          {b.type === "heading" && (
            <label>
              Heading level
              <select
                value={b.level || 2}
                onChange={(e) => update(i, "level", Number(e.target.value))}
              >
                {[2, 3, 4, 5, 6].map((x) => (
                  <option key={x} value={x}>
                    Heading {x}
                  </option>
                ))}
              </select>
            </label>
          )}
          {b.type === "code" && (
            <label>
              Language
              <input
                value={b.language || ""}
                onChange={(e) => update(i, "language", e.target.value)}
              />
            </label>
          )}
          {["image", "video"].includes(b.type) && (
            <>
              <MediaPicker
                title={label(b.type)}
                value={b.mediaId}
                kind={b.type}
                options={options}
                required
                onChange={(id) => update(i, "mediaId", id)}
              />
              <label>
                Alt text
                <input
                  value={b.alt || ""}
                  onChange={(e) => update(i, "alt", e.target.value)}
                />
              </label>
            </>
          )}
          {["youtube", "link"].includes(b.type) && (
            <label>
              {b.type === "link" ? "Link destination" : "YouTube URL"}
              <input
                data-field-path={`${path}[${i}].url`}
                aria-invalid={errors[`${path}[${i}].url`] ? true : undefined}
                aria-describedby={
                  errors[`${path}[${i}].url`]
                    ? `error-${path}-${i}-url`
                    : undefined
                }
                style={
                  errors[`${path}[${i}].url`]
                    ? { borderColor: "#b42318" }
                    : undefined
                }
                value={b.url || ""}
                placeholder="https://www.youtube.com/watch?v=…"
                onChange={(e) => update(i, "url", e.target.value)}
              />
              {errors[`${path}[${i}].url`] && (
                <small
                  id={`error-${path}-${i}-url`}
                  role="alert"
                  style={{ color: "#b42318", display: "block" }}
                >
                  {errors[`${path}[${i}].url`]}
                </small>
              )}
            </label>
          )}
          {["image", "video", "youtube"].includes(b.type) && (
            <label>
              Caption
              <input
                value={b.caption || ""}
                onChange={(e) => update(i, "caption", e.target.value)}
              />
            </label>
          )}
          {b.type === "list" && (
            <>
              <label>
                List items
                <textarea
                  value={(b.items || []).join("\n")}
                  onChange={(e) =>
                    update(i, "items", e.target.value.split("\n"))
                  }
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={!!b.ordered}
                  onChange={(e) => update(i, "ordered", e.target.checked)}
                />
                Numbered list
              </label>
            </>
          )}
        </div>
      ))}
      <div className="row">
        <select
          aria-label="Block type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {[
            "paragraph",
            "heading",
            "image",
            "video",
            "youtube",
            "quote",
            "code",
            "list",
            "link",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button
          type="button"
          className="button outline small"
          onClick={() =>
            onChange([
              ...value,
              {
                type,
                ...(type === "heading" ? { level: 2 } : {}),
                ...(["paragraph", "heading", "quote", "code"].includes(type)
                  ? { text: "" }
                  : {}),
              },
            ])
          }
        >
          + Add block
        </button>
      </div>
    </fieldset>
  );
}
