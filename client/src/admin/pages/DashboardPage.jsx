import React, { useEffect, useState } from "react";
import { api } from "../../services/adminApi.js";
import { label } from "../config/fields.js";

export function Dashboard() {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("/api/admin/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <p className="eyebrow orange">STUDIO / OVERVIEW</p>
      <h1>Welcome to your workspace.</h1>
      <p>Shape the next chapter of your portfolio.</p>
      {error && <p className="error">{error}</p>}
      {data ? (
        <>
          <div className="grid admin-stats">
            {Object.entries(data.counts).map(([k, v]) => (
              <a className="card" key={k} href={"/admin/" + k}>
                <span className="eyebrow">{label(k)}</span>
                <h2>{v}</h2>
                <p>
                  {k === "inquiries" ? "Unread inquiries" : "Saved records"}
                </p>
              </a>
            ))}
          </div>
          <div className="actions">
            <a className="button" href="/admin/projects/new">
              + New Project
            </a>
            <a className="button outline" href="/admin/blog_posts/new">
              Write an Article ↗
            </a>
          </div>
          <div className="card">
            <h2>Recent activity</h2>
            {data.recent.length ? (
              data.recent.map((x) => (
                <div className="list-row" key={x._id}>
                  <span>
                    {label(x.targetCollection)} · {x.action}
                  </span>
                  <small>{new Date(x.createdAt).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p className="muted">Your content activity will appear here.</p>
            )}
          </div>
        </>
      ) : (
        <p>Loading dashboard…</p>
      )}
    </>
  );
}
