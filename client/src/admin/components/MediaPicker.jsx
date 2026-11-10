import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../services/adminApi.js";
import { Upload } from "./MediaUpload.jsx";

export function mediaKind(name, parent = {}) {
  if (
    [
      "coverId",
      "logoId",
      "profileImageId",
      "shareImageId",
      "iconMediaId",
      "portraitId",
    ].includes(name) ||
    parent.type === "image"
  )
    return "image";
  if (["heroVideoId", "videoId"].includes(name) || parent.type === "video")
    return "video";
  if (name === "resumeId") return "document";
  return "image,video";
}
function Thumbnail({ item }) {
  return item.kind === "image" ? (
    <img src={"/media/" + item._id} alt="" loading="lazy" />
  ) : (
    <span className="media-kind-icon">
      {item.kind === "video" ? "▶ Video" : "PDF"}
    </span>
  );
}
export function MediaPicker({
  title,
  value,
  onChange,
  options = {},
  kind = "image",
  multiple = false,
  max = 20,
  required = false,
}) {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState([]),
    [known, setKnown] = useState({}),
    [rows, setRows] = useState([]),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [uploading, setUploading] = useState(false);
  const dialog = useRef(null),
    search = useRef(null),
    trigger = useRef(null);
  const chosen = multiple ? value || [] : value ? [value] : [];
  const cache = Object.fromEntries(
    (options.media || []).map((x) => [x._id, x]),
  );
  Object.assign(cache, known);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element.showModal();
    search.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      trigger.current?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let current = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      api(
        `/api/admin/media?page=${page}&q=${encodeURIComponent(query)}&kind=${encodeURIComponent(kind)}`,
      )
        .then((out) => {
          if (!current) return;
          setRows(out.items);
          setTotal(out.total);
          setKnown((old) => ({
            ...old,
            ...Object.fromEntries(out.items.map((x) => [x._id, x])),
          }));
        })
        .catch((e) => {
          if (current) setError(e.message);
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, 150);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [open, page, query, kind, revision]);
  const missing = chosen.filter((id) => !cache[id]).join(",");
  useEffect(() => {
    if (!missing) return;
    let current = true;
    Promise.allSettled(
      missing.split(",").map((id) => api(`/api/admin/media/${id}`)),
    ).then((out) => {
      if (current)
        setKnown((old) => ({
          ...old,
          ...Object.fromEntries(
            out
              .filter((x) => x.status === "fulfilled")
              .map((x) => [x.value._id, x.value]),
          ),
        }));
    });
    return () => {
      current = false;
    };
  }, [missing]);
  const close = () => {
    if (!uploading) setOpen(false);
  };
  return (
    <div className="media-field">
      <span className="media-field-title">
        {title}
        {required ? " *" : ""}
      </span>
      {!!chosen.length && (
        <div className="media-selection">
          {chosen.map((id) => (
            <div className="media-selected" key={id}>
              <Thumbnail
                item={
                  cache[id] || {
                    _id: id,
                    kind: kind === "image" ? "image" : "document",
                  }
                }
              />
              <span>{cache[id]?.originalName || "Selected media"}</span>
              <a
                href={"/media/" + id}
                target="_blank"
                rel="noopener noreferrer"
              >
                View ↗
              </a>
            </div>
          ))}
        </div>
      )}
      <div className="row">
        <button
          ref={trigger}
          type="button"
          className="button outline small"
          onClick={() => {
            setDraft(chosen);
            setQuery("");
            setPage(1);
            setRows([]);
            setError("");
            setOpen(true);
          }}
        >
          Choose files from Media Library
        </button>
        {!!chosen.length && (
          <button
            type="button"
            className="mini"
            onClick={() => onChange(multiple ? [] : undefined)}
          >
            Clear selection
          </button>
        )}
      </div>
      <small>
        {multiple
          ? `Choose up to ${max} files at once.`
          : "Choose a file visually, or upload a new one in the picker."}
      </small>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="media-picker"
            aria-label={`Choose ${title} from Media Library`}
            onCancel={(e) => {
              e.preventDefault();
              close();
            }}
          >
            <div className="media-picker-header">
              <div>
                <h2>Choose from Media Library</h2>
                <p>
                  {title} ·{" "}
                  {multiple ? `Select up to ${max} files` : "Select one file"}
                </p>
              </div>
              <button
                type="button"
                className="mini"
                disabled={uploading}
                onClick={close}
                aria-label="Close media picker"
              >
                ✕
              </button>
            </div>
            <div className="media-picker-body">
              <Upload
                accept={
                  kind === "image"
                    ? "image/jpeg,image/png,image/webp,image/gif"
                    : kind === "video"
                      ? "video/mp4,video/webm"
                      : kind === "document"
                        ? "application/pdf"
                        : "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                }
                onBusyChange={setUploading}
                onDone={(items) => {
                  setKnown((old) => ({
                    ...old,
                    ...Object.fromEntries(items.map((x) => [x._id, x])),
                  }));
                  setRevision((x) => x + 1);
                  setPage(1);
                  setQuery("");
                }}
              />
              <label>
                Search files
                <input
                  ref={search}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by filename…"
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                  <button
                    type="button"
                    className="mini"
                    onClick={() => setRevision((x) => x + 1)}
                  >
                    Retry
                  </button>
                </p>
              )}
              {loading ? (
                <p role="status">Loading files…</p>
              ) : (
                <div className="media-picker-grid">
                  {rows.map((item) => (
                    <button
                      type="button"
                      className={
                        "media-picker-item " +
                        (draft.includes(item._id) ? "selected" : "")
                      }
                      key={item._id}
                      aria-pressed={draft.includes(item._id)}
                      disabled={
                        multiple &&
                        !draft.includes(item._id) &&
                        draft.length >= max
                      }
                      onClick={() =>
                        setDraft((old) =>
                          old.includes(item._id)
                            ? old.filter((id) => id !== item._id)
                            : multiple
                              ? [...old, item._id]
                              : [item._id],
                        )
                      }
                    >
                      <Thumbnail item={item} />
                      <span>{item.originalName}</span>
                      <small>
                        {draft.includes(item._id) ? "✓ Selected" : item.kind}
                      </small>
                    </button>
                  ))}
                  {!rows.length && !error && (
                    <p>
                      No matching files. Upload files above or try another
                      search.
                    </p>
                  )}
                </div>
              )}
              <div className="pagination">
                <button
                  type="button"
                  className="mini"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((x) => x - 1)}
                >
                  ← Previous
                </button>
                <span>
                  {total} files · Page {page}
                </span>
                <button
                  type="button"
                  className="mini"
                  disabled={page * 25 >= total || loading}
                  onClick={() => setPage((x) => x + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
            <div className="media-picker-footer">
              <span role="status">
                {draft.length} selected{multiple ? ` / ${max}` : ""}
              </span>
              <button
                type="button"
                className="mini"
                disabled={uploading}
                onClick={close}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button small"
                disabled={uploading || !draft.length || draft.length > max}
                onClick={() => {
                  onChange(multiple ? draft : draft[0]);
                  setOpen(false);
                }}
              >
                Use selected {multiple ? "files" : "file"}
              </button>
            </div>
          </dialog>,
          document.body,
        )}
    </div>
  );
}
