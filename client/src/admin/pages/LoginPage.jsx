import React, { useState } from "react";
import { api, setCsrfToken } from "../../services/adminApi.js";

export function Login({ onLogin }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  return (
    <div className="login-shell">
      <form
        className="card login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const out = await api("/api/auth/login", {
              method: "POST",
              body: JSON.stringify(
                Object.fromEntries(new FormData(e.currentTarget)),
              ),
            });
            setCsrfToken(out.csrf);
            onLogin(out.user);
            window.location.assign("/admin");
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="eyebrow orange">PRIVATE / CONTENT STUDIO</p>
        <a className="wordmark" href="/">
          ABDUL SAMAD<span>.</span>
        </a>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your portfolio.</p>
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
          />
          Show password
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button disabled={busy} className="button">
          {busy ? "Signing in…" : "Sign in →"}
        </button>
        <a href="/">← Back to website</a>
      </form>
    </div>
  );
}
