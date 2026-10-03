/**
 * api.js — Central API communication layer.
 * ALL fetch calls to the backend go through this file.
 * Page scripts import functions from here; they never call fetch() directly.
 */

const API_BASE = (window.location.protocol === "file:" || window.location.port === "5500")
  ? "http://127.0.0.1:8000/api"
  : "/api";

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------
async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    const isPagesFolder = window.location.pathname.includes("/pages/");
    window.location.href = isPagesFolder ? "login.html" : "pages/login.html";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API request failed");
  }

  // 204 No Content has no body
  if (res.status === 204) return null;
  return res.json();
}

// ---------------------------------------------------------------------------
// Heritage Sites
// ---------------------------------------------------------------------------
export const sitesApi = {
  getAll:    (skip = 0, limit = 100) => request("GET",  `/sites/?skip=${skip}&limit=${limit}`),
  getById:   (id)                    => request("GET",  `/sites/${id}`),
  create:    (data)                  => request("POST", `/sites/`, data),
  update:    (id, data)              => request("PATCH",`/sites/${id}`, data),
  remove:    (id)                    => request("DELETE",`/sites/${id}`),
};

// ---------------------------------------------------------------------------
// Maintenance Records
// ---------------------------------------------------------------------------
export const maintenanceApi = {
  getAll:       (skip = 0, limit = 100) => request("GET",  `/maintenance/?skip=${skip}&limit=${limit}`),
  getBySite:    (siteId)                => request("GET",  `/maintenance/site/${siteId}`),
  getById:      (id)                    => request("GET",  `/maintenance/${id}`),
  create:       (data)                  => request("POST", `/maintenance/`, data),
  update:       (id, data)              => request("PATCH",`/maintenance/${id}`, data),
  remove:       (id)                    => request("DELETE",`/maintenance/${id}`),
};

// ---------------------------------------------------------------------------
// Visitor Records
// ---------------------------------------------------------------------------
export const visitorsApi = {
  getAll:    (skip = 0, limit = 100) => request("GET",  `/visitors/?skip=${skip}&limit=${limit}`),
  getBySite: (siteId)                => request("GET",  `/visitors/site/${siteId}`),
  getById:   (id)                    => request("GET",  `/visitors/${id}`),
  create:    (data)                  => request("POST", `/visitors/`, data),
  update:    (id, data)              => request("PATCH",`/visitors/${id}`, data),
  remove:    (id)                    => request("DELETE",`/visitors/${id}`),
};

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
export function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
