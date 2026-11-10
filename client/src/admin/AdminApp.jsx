import React, { useEffect, useState } from "react";
import { api, setCsrfToken } from "../services/adminApi.js";
import { Login } from "./pages/LoginPage.jsx";
import { Dashboard } from "./pages/DashboardPage.jsx";
import { Account } from "./pages/AccountPage.jsx";
import { settingsViews, modules } from "./config/fields.js";
import { Singleton } from "./pages/SettingsPage.jsx";
import { Collection } from "./pages/CollectionPage.jsx";

export function AdminApp({ initial }) {
  const [user, setUser] = useState(initial.user),
    [defs, setDefs] = useState(null),
    [options, setOptions] = useState({}),
    [err, setErr] = useState(""),
    [menu, setMenu] = useState(false);
  const pathParts = window.location.pathname.split("/");
  const view = pathParts[2] || "dashboard",
    id = pathParts[3];
  useEffect(() => {
    if (!user) return;
    api("/api/auth/me")
      .then((out) => {
        setCsrfToken(out.csrf);
        return Promise.all([
          api("/api/admin/schema"),
          api("/api/admin/reference-options"),
        ]);
      })
      .then(([a, b]) => {
        setDefs(a.collections);
        setOptions(b);
      })
      .catch((e) => setErr(e.message));
  }, [user]);
  if (!user) return <Login onLogin={setUser} />;
  let body = !defs ? (
    <p>{err || "Loading content studio…"}</p>
  ) : view === "dashboard" ? (
    <Dashboard />
  ) : view === "account" ? (
    <Account user={user} />
  ) : settingsViews[view] || ["about", "privacy"].includes(view) ? (
    <Singleton key={view} view={view} defs={defs} options={options} />
  ) : defs[view] ? (
    <Collection
      key={view}
      name={view}
      id={id}
      definition={defs[view]}
      options={options}
    />
  ) : (
    <p>Choose a module from the menu.</p>
  );
  return (
    <div className="admin-shell">
      <aside className={"admin-sidebar " + (menu ? "open" : "")}>
        <a className="wordmark" href="/admin">
          SAMAD<span>.CMS</span>
        </a>
        <p className="eyebrow">PORTFOLIO / WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {modules.map(([l, u]) => (
            <a
              key={u}
              href={"/admin/" + (u === "dashboard" ? "" : u)}
              aria-current={view === u ? "page" : undefined}
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="sidebar-account">
          <b>{user.name}</b>
          <small>{user.email}</small>
          <button
            className="mini"
            onClick={async () => {
              try {
                await api("/api/auth/logout", { method: "POST" });
                window.location.assign("/admin/login");
              } catch (e) {
                setErr(e.message);
              }
            }}
          >
            Sign out
          </button>
          {err && <p role="alert">{err}</p>}
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-header">
          <button
            aria-label="Toggle admin navigation"
            aria-expanded={menu}
            className="mini menu-toggle"
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
          <span className="eyebrow">CONTENT STUDIO</span>
          <a
            className="button outline small"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Live Site ↗
          </a>
        </header>
        <main className="admin-main">{body}</main>
      </div>
    </div>
  );
}
