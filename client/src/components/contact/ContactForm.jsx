import React, { useState } from "react";
import { Icon } from "../ui/Icon.jsx";

export function ContactForm({ services = [] }) {
  const [state, setState] = useState({ busy: false, error: "", done: false });
  return (
    <form
      className="card contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setState({ busy: true, error: "", done: false });
        try {
          const data = Object.fromEntries(new FormData(form));
          const r = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const out = await r.json();
          if (!r.ok) throw new Error(out.error || "Please try again.");
          form.reset();
          setState({ busy: false, error: "", done: true });
        } catch (err) {
          setState({ busy: false, error: err.message, done: false });
        }
      }}
    >
      <h3>Tell me about your idea.</h3>
      <p>Share a little about what you have in mind.</p>
      <div className="two-col">
        <label>
          Your name
          <input name="name" required maxLength="120" autoComplete="name" />
        </label>
        <label>
          Email address
          <input
            type="email"
            name="email"
            required
            maxLength="254"
            autoComplete="email"
          />
        </label>
      </div>
      <label>
        Service interest
        <select name="serviceInterest">
          <option value="">Choose a service</option>
          {services.map((s) => (
            <option key={s._id}>{s.title}</option>
          ))}
          <option>Something else</option>
        </select>
      </label>
      <label>
        Budget (optional)
        <input
          name="budget"
          maxLength="255"
          placeholder="Your approximate budget and currency"
        />
      </label>
      <label>
        Project details
        <textarea
          name="message"
          required
          minLength="10"
          maxLength="20000"
          rows="5"
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex="-1" autoComplete="off" />
      </label>
      {state.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
      {state.done && (
        <p role="status" className="success">
          Your inquiry has been saved. Thank you for reaching out.
        </p>
      )}
      <button className="button accent" disabled={state.busy}>
        {state.busy ? "Sending…" : "Send Inquiry"} <Icon />
      </button>
    </form>
  );
}
