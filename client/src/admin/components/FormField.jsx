import React, { useContext } from "react";
import { ValidationContext } from "./ValidationContext.jsx";
import { label, refs } from "../config/fields.js";
import { BlockEditor } from "./BlockEditor.jsx";
import { MediaPicker, mediaKind } from "./MediaPicker.jsx";

export function Field({
  name,
  spec,
  value,
  onChange,
  options,
  parent = {},
  required = false,
  path = name,
}) {
  const errors = useContext(ValidationContext),
    problem = errors[path];
  const errorId = "error-" + path;
  const title = label(name);
  const reference =
    refs[name] ||
    (name === "targetId"
      ? { project: "projects", venture: "ventures", inquiry: "inquiries" }[
          parent.targetType
        ]
      : null);
  if (name === "content")
    return (
      <BlockEditor
        value={value || []}
        onChange={onChange}
        options={options}
        path={path}
      />
    );
  if (reference === "media" && spec.bsonType === "objectId")
    return (
      <MediaPicker
        title={title}
        value={value}
        onChange={onChange}
        options={options}
        kind={mediaKind(name, parent)}
        required={required}
      />
    );
  if (spec.bsonType === "bool")
    return (
      <label className="checkbox">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {title}
      </label>
    );
  if (spec.bsonType === "object")
    return (
      <fieldset>
        <legend>{title}</legend>
        {Object.entries(spec.properties).map(([k, v]) => (
          <Field
            key={k}
            path={`${path}.${k}`}
            name={k}
            spec={v}
            value={value?.[k]}
            options={options}
            parent={value || {}}
            onChange={(x) => onChange({ ...value, [k]: x })}
            required={spec.required?.includes(k)}
          />
        ))}
      </fieldset>
    );
  if (spec.bsonType === "array") {
    if (spec.items.bsonType === "objectId")
      return (
        <label>
          {title}
          <select
            multiple
            value={value || []}
            onChange={(e) =>
              onChange([...e.target.selectedOptions].map((o) => o.value))
            }
          >
            {(options[reference] || []).map((o) => (
              <option key={o._id} value={o._id}>
                {o.title || o.name || o.originalName || o._id}
              </option>
            ))}
          </select>
          <small>Hold Ctrl/Command to choose multiple items.</small>
        </label>
      );
    if (spec.items.enum)
      return (
        <fieldset>
          <legend>{title}</legend>
          {spec.items.enum.map((x) => (
            <label key={x} className="checkbox">
              <input
                type="checkbox"
                checked={(value || []).includes(x)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...(value || []), x]
                      : (value || []).filter((v) => v !== x),
                  )
                }
              />
              {label(x)}
            </label>
          ))}
        </fieldset>
      );
    if (spec.items.bsonType === "string")
      return (
        <label>
          {title}
          <textarea
            value={(value || []).join("\n")}
            rows="3"
            placeholder="One item per line"
            onChange={(e) => onChange(e.target.value.split("\n"))}
          />
        </label>
      );
    return (
      <fieldset>
        <legend>{title}</legend>
        {(value || []).map((item, i) => (
          <div className="array-item" key={i}>
            <div className="row">
              <b>
                {title} {i + 1}
              </b>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const a = [...value];
                  if (i > 0) {
                    [a[i - 1], a[i]] = [a[i], a[i - 1]];
                    onChange(a);
                  }
                }}
                aria-label="Move item up"
              >
                ↑
              </button>
              <button
                type="button"
                className="mini"
                onClick={() => {
                  const a = [...value];
                  if (i < a.length - 1) {
                    [a[i + 1], a[i]] = [a[i], a[i + 1]];
                    onChange(a);
                  }
                }}
                aria-label="Move item down"
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
            {Object.entries(spec.items.properties || {}).map(([k, v]) => (
              <Field
                key={k}
                path={`${path}[${i}].${k}`}
                name={k}
                spec={v}
                value={item[k]}
                parent={item}
                options={options}
                required={spec.items.required?.includes(k)}
                onChange={(x) =>
                  onChange(
                    value.map((it, j) => (j === i ? { ...it, [k]: x } : it)),
                  )
                }
              />
            ))}
          </div>
        ))}
        {name === "gallery" && (
          <MediaPicker
            title="Add gallery files"
            multiple
            value={[]}
            kind="image,video"
            options={options}
            onChange={(ids) => {
              const existing = new Set(
                (value || []).map((item) => item.mediaId),
              );
              onChange([
                ...(value || []),
                ...ids
                  .filter((id) => !existing.has(id))
                  .map((mediaId) => ({ mediaId })),
              ]);
            }}
          />
        )}
        <button
          type="button"
          className="button outline small"
          onClick={() => onChange([...(value || []), {}])}
        >
          + Add {title.toLowerCase()}
        </button>
      </fieldset>
    );
  }
  if (reference || spec.bsonType === "objectId")
    return (
      <label>
        {title}
        {required ? " *" : ""}
        <select
          required={required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">Choose an item</option>
          {(options[reference] || []).map((o) => (
            <option key={o._id} value={o._id}>
              {o.title || o.name || o.originalName || o._id}
              {o.kind ? " · " + o.kind : ""}
            </option>
          ))}
        </select>
      </label>
    );
  if (spec.enum)
    return (
      <label>
        {title}
        {required ? " *" : ""}
        <select
          value={value || ""}
          required={required}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">Choose…</option>
          {spec.enum.map((x) => (
            <option value={x} key={x}>
              {x.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>
    );
  if (spec.bsonType === "date")
    return (
      <label>
        {title}
        <input
          type="datetime-local"
          value={
            value
              ? new Date(
                  new Date(value).getTime() -
                    new Date(value).getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
          onChange={(e) =>
            onChange(
              e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            )
          }
        />
      </label>
    );
  if (spec.bsonType === "int" || Array.isArray(spec.bsonType))
    return (
      <label>
        {title}
        <input
          type="number"
          min={spec.minimum}
          max={spec.maximum}
          step={spec.bsonType === "int" ? 1 : "any"}
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      </label>
    );
  const multiline =
    /description|summary|excerpt|answer|body|text|message|caption/i.test(
      name,
    ) && !["type", "context", "subtitle"].includes(name);
  return (
    <label>
      {title}
      {required ? " *" : ""}
      {multiline ? (
        <textarea
          rows="4"
          data-field-path={path}
          aria-invalid={problem ? true : undefined}
          aria-describedby={problem ? errorId : undefined}
          style={problem ? { borderColor: "#b42318" } : undefined}
          value={value || ""}
          required={required}
          maxLength={spec.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          data-field-path={path}
          aria-invalid={problem ? true : undefined}
          aria-describedby={problem ? errorId : undefined}
          style={problem ? { borderColor: "#b42318" } : undefined}
          value={value || ""}
          required={required}
          maxLength={spec.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {problem && (
        <small
          id={errorId}
          role="alert"
          className="field-error"
          style={{ color: "#b42318", display: "block" }}
        >
          {problem}
        </small>
      )}
    </label>
  );
}
