import React, { useEffect, useState } from "react";
import { api } from "../../services/adminApi.js";
import { Editor } from "../components/ContentEditor.jsx";
import { label } from "../config/fields.js";
import { Upload } from "../components/MediaUpload.jsx";

export function Collection({ name, definition, options, id }) {
  const [rows, setRows] = useState([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  const [importingJourney, setImportingJourney] = useState(false);
  const [journeyMessage, setJourneyMessage] = useState("");

  async function importJourney() {
    setImportingJourney(true);
    setJourneyMessage("");
    try {
      const { added, skipped } = await api("/api/admin/skill_items/import-journey", {
        method: "POST",
      });
      setQuery("");
      setPage(1);
      setJourneyMessage(`Added ${added} Beyond Code chapters. ${skipped} already existed.`);
    } catch (e) {
      setJourneyMessage(e.message);
    } finally {
      setRevision((value) => value + 1);
      setImportingJourney(false);
    }
  }
  useEffect(() => {
    if (id) return;
    setLoading(true);
    api(
      `/api/admin/${name}?page=${page}&q=${encodeURIComponent(query)}&status=${status}`,
    )
      .then((out) => {
        setRows(out.items);
        setTotal(out.total);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [name, page, query, status, id, revision]);
  if (id)
    return (
      <Editor
        collection={name}
        id={id}
        definition={definition}
        options={options}
        fields={
          name === "media"
            ? ["alt", "caption"]
            : name === "inquiries"
              ? ["status"]
              : undefined
        }
      />
    );
  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow orange">CONTENT / STUDIO</p>
          <h1>{label(name)}</h1>
        </div>
        {!["media", "inquiries", "pages"].includes(name) && (
          <a className="button small" href={`/admin/${name}/new`}>
            + Add New
          </a>
        )}
      </div>
      {name === "skill_items" && (
        <div className="row">
          <button
            type="button"
            className="button small outline"
            disabled={importingJourney}
            onClick={importJourney}
          >
            {importingJourney ? "Importing…" : "Import Beyond Code chapters"}
          </button>
          {journeyMessage && <span role="status">{journeyMessage}</span>}
        </div>
      )}
      {name === "media" && <Upload onDone={() => setRevision((x) => x + 1)} />}
      <div className="filter-bar">
        <label className="search-label">
          Search
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search records…"
          />
        </label>
        {definition.validator.$jsonSchema.properties.publicationStatus && (
          <label>
            Publication
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option>draft</option>
              <option>published</option>
            </select>
          </label>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div
          className={name === "media" ? "grid media-grid" : "card table-card"}
        >
          {rows.length ? (
            rows.map((row) => (
              <div
                key={row._id}
                className={name === "media" ? "card media-card" : "list-row"}
              >
                {name === "media" &&
                  (row.kind === "image" ? (
                    <img src={"/media/" + row._id} alt={row.alt || ""} />
                  ) : (
                    <div className="file-icon">
                      {row.kind === "video" ? "▶" : "PDF"}
                    </div>
                  ))}
                <div className="list-main">
                  <a
                    className="record-title"
                    href={`/admin/${name}/${row._id}`}
                  >
                    {row.title ||
                      row.name ||
                      row.originalName ||
                      row.key ||
                      row.targetType ||
                      "Untitled"}
                  </a>
                  <small>
                    {row.slug || row.email || row.group || row.kind}
                  </small>
                </div>
                <span className="badge">
                  {name === "skill_items"
                    ? (row.visible ? "Visible" : "Hidden")
                    : row.publicationStatus || row.status || ""}
                </span>
                {row.progressStatus && (
                  <span className="badge">
                    {row.progressStatus.replace(/_/g, " ")}
                  </span>
                )}
                <div className="row">
                  <a className="mini" href={`/admin/${name}/${row._id}`}>
                    Edit
                  </a>
                  {!["pages", "home_sections", "portfolio_settings"].includes(
                    name,
                  ) && (
                    <button
                      className="mini danger"
                      onClick={async () => {
                        if (
                          !confirm("Delete this record? This cannot be undone.")
                        )
                          return;
                        try {
                          await api(`/api/admin/${name}/${row._id}`, {
                            method: "DELETE",
                          });
                          setRevision((x) => x + 1);
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              No records yet. Add your first item to get started.
            </div>
          )}
        </div>
      )}
      <div className="pagination">
        <button
          className="mini"
          disabled={page === 1}
          onClick={() => setPage((x) => x - 1)}
        >
          ← Previous
        </button>
        <span>
          {total} records · Page {page}
        </span>
        <button
          className="mini"
          disabled={page * 25 >= total}
          onClick={() => setPage((x) => x + 1)}
        >
          Next →
        </button>
      </div>
    </>
  );
}
