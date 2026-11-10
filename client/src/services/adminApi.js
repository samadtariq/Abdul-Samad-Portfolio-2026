let token = "";

export async function api(url, options = {}) {
  const r = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
      ...options.headers,
    },
  });
  const out = await r.json();
  if (!r.ok) {
    if (r.status === 401 && url !== "/api/auth/login")
      window.location.assign("/admin/login");
    throw Object.assign(new Error(out.error || "Request failed"), {
      fieldErrors: out.fieldErrors || {},
    });
  }
  return out;
}

export function setCsrfToken(value) {
  token = value;
}

export function getCsrfToken() {
  return token;
}
