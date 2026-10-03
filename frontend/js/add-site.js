/**
 * add-site.js — Logic for the Add Site form page.
 */

import { sitesApi, showToast } from "./api.js";
import { initAuthGuard } from "./auth.js";

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector("#submit-btn");

  const name     = form.name.value.trim();
  const location = form.location.value.trim();
  const category = form.category.value;

  if (!name)     { showToast("Site Name is required.", "error"); return; }
  if (!location) { showToast("Location is required.", "error"); return; }
  if (!category) { showToast("Category is required.", "error"); return; }

  btn.disabled = true;
  btn.textContent = "Saving…";

  const payload = {
    name,
    location,
    category,
    image_url:        form.image_url.value.trim()      || null,
    description:      form.description.value.trim()   || null,
    year_established: form.year_established.value ? parseInt(form.year_established.value) : null,
    significance:     form.significance.value.trim()  || null,
  };

  try {
    await sitesApi.create(payload);
    showToast("Heritage site added successfully!", "success");
    setTimeout(() => window.location.href = "sites.html", 1200);
  } catch (err) {
    if (!err.message.includes("Session expired")) {
      showToast(`Error: ${err.message}`, "error");
    }
    btn.disabled = false;
    btn.textContent = "Add Site";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthGuard();
  const form = document.getElementById("add-site-form");
  if (form) form.addEventListener("submit", handleSubmit);
});
