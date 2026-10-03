/**
 * add-site.js — Logic for the Add Site form page.
 */

import { sitesApi, showToast } from "./api.js";

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector("#submit-btn");
  btn.disabled = true;
  btn.textContent = "Saving…";

  const payload = {
    name:             form.name.value.trim(),
    location:         form.location.value.trim(),
    category:         form.category.value.trim(),
    description:      form.description.value.trim() || null,
    year_established: form.year_established.value ? parseInt(form.year_established.value) : null,
    significance:     form.significance.value.trim() || null,
  };

  try {
    await sitesApi.create(payload);
    showToast("Heritage site added successfully!", "success");
    setTimeout(() => window.location.href = "sites.html", 1500);
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
    btn.disabled = false;
    btn.textContent = "Add Site";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-site-form");
  if (form) form.addEventListener("submit", handleSubmit);
});
