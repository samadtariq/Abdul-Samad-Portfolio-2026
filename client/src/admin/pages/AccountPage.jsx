import React, { useState } from "react";
import { api } from "../../services/adminApi.js";

export function Account({ user }) {
  const [message, setMessage] = useState("");
  return (
    <>
      <h1>Account Settings</h1>
      <form
        className="card editor-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setMessage("Saving…");
          try {
            await api("/api/auth/account", {
              method: "PATCH",
              body: JSON.stringify(
                Object.fromEntries(new FormData(e.currentTarget)),
              ),
            });
            window.location.assign("/admin/login");
          } catch (e) {
            setMessage(e.message);
          }
        }}
      >
        <label>
          Name
          <input name="name" defaultValue={user.name} required />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={user.email} required />
        </label>
        <label>
          Current password
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          New password (optional)
          <input
            name="newPassword"
            type="password"
            minLength="12"
            autoComplete="new-password"
          />
        </label>
        <p>Saving account changes signs out all sessions.</p>
        <p role="status">{message}</p>
        <button className="button">Save Account & Sign Out</button>
      </form>
    </>
  );
}
