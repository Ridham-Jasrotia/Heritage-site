/**
 * site-detail.js — Site Detail page logic.
 * Reads ?id= from the URL; loads site info, maintenance, visitor records.
 * Also handles Edit (PATCH /api/sites/{id}) and Delete (DELETE /api/sites/{id}).
 */

import { sitesApi, maintenanceApi, visitorsApi, showToast } from "./api.js";

const STATUS_BADGE = {
  "Pending":     "badge-warning",
  "In Progress": "badge-info",
  "Completed":   "badge-success",
};

// ---------------------------------------------------------------------------
// Get the site ID from the URL once
// ---------------------------------------------------------------------------
const SITE_ID = new URLSearchParams(window.location.search).get("id");

// ---------------------------------------------------------------------------
// Render site info into the read-only display fields (unchanged from original)
// ---------------------------------------------------------------------------
function renderSiteInfo(site) {
  document.title = `${site.name} | HeritageMS`;
  document.getElementById("detail-name").textContent        = site.name;
  document.getElementById("detail-location").textContent    = site.location;
  document.getElementById("detail-category").textContent    = site.category;
  document.getElementById("detail-description").textContent = site.description || "No description provided.";
  document.getElementById("detail-year").textContent        = site.year_established ?? "—";
  document.getElementById("detail-significance").textContent = site.significance || "—";
}

// ---------------------------------------------------------------------------
// Populate the edit form with the site's current values
// ---------------------------------------------------------------------------
function populateEditForm(site) {
  const f = document.getElementById("edit-site-form");
  f.name.value             = site.name              ?? "";
  f.location.value         = site.location          ?? "";
  f.year_established.value = site.year_established  ?? "";
  f.latitude.value         = site.latitude          ?? "";
  f.longitude.value        = site.longitude         ?? "";
  f.image_url.value        = site.image_url         ?? "";
  f.description.value      = site.description       ?? "";
  f.significance.value     = site.significance      ?? "";

  // Category select — set the matching option
  const catSelect = document.getElementById("e-category");
  const opt = [...catSelect.options].find(o => o.value === site.category);
  if (opt) {
    catSelect.value = site.category;
  } else {
    // Site has a category not in the list — add it so the value is preserved
    const extra = document.createElement("option");
    extra.value = site.category;
    extra.textContent = site.category;
    catSelect.appendChild(extra);
    catSelect.value = site.category;
  }
}

// ---------------------------------------------------------------------------
// Load all site data (original logic preserved)
// ---------------------------------------------------------------------------
async function loadSiteDetail() {
  if (!SITE_ID) {
    showToast("No site ID provided.", "error");
    return;
  }

  try {
    const [site, maintenance, visitors] = await Promise.all([
      sitesApi.getById(SITE_ID),
      maintenanceApi.getBySite(SITE_ID),
      visitorsApi.getBySite(SITE_ID),
    ]);

    renderSiteInfo(site);

    // Maintenance table
    const mtbody = document.getElementById("site-maintenance-body");
    mtbody.innerHTML = "";
    if (maintenance.length === 0) {
      mtbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No maintenance records for this site.</td></tr>';
    } else {
      maintenance.forEach((rec, i) => {
        const badge = STATUS_BADGE[rec.status] || "badge-info";
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${i+1}</td><td>${rec.title}</td><td><span class="badge ${badge}">${rec.status}</span></td><td>${rec.priority}</td><td>${rec.scheduled_date ?? "—"}</td>`;
        mtbody.appendChild(tr);
      });
    }

    // Visitor table
    const vtbody = document.getElementById("site-visitors-body");
    vtbody.innerHTML = "";
    if (visitors.length === 0) {
      vtbody.innerHTML = '<tr><td colspan="4" class="loading-cell">No visitor records for this site.</td></tr>';
    } else {
      visitors.forEach((rec, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${i+1}</td><td>${rec.visit_date}</td><td>${rec.visitor_count.toLocaleString()}</td><td>${rec.visitor_type ?? "—"}</td>`;
        vtbody.appendChild(tr);
      });
    }

    return site; // return for use by edit init
  } catch (err) {
    showToast(`Failed to load site details: ${err.message}`, "error");
    console.error(err);
  }
}

// ---------------------------------------------------------------------------
// Edit functionality
// ---------------------------------------------------------------------------
function initEdit(site) {
  const editBtn    = document.getElementById("btn-edit-site");
  const cancelBtn  = document.getElementById("btn-cancel-edit");
  const formPanel  = document.getElementById("edit-form-panel");
  const form       = document.getElementById("edit-site-form");
  const submitBtn  = document.getElementById("e-submit-btn");

  // Keep a reference to the current site data so we can re-open the form
  // after a failed save without losing the user's edits
  let currentSite = site;

  function openEditForm() {
    populateEditForm(currentSite);
    formPanel.style.display = "block";
    editBtn.textContent = "Close";
    formPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function closeEditForm() {
    formPanel.style.display = "none";
    editBtn.textContent = "Edit Site";
    form.reset();
  }

  editBtn.addEventListener("click", () => {
    const isOpen = formPanel.style.display !== "none";
    isOpen ? closeEditForm() : openEditForm();
  });

  cancelBtn.addEventListener("click", closeEditForm);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate required fields (name, location, category are required in the schema)
    const name     = form.name.value.trim();
    const location = form.location.value.trim();
    const category = form.category.value;

    if (!name)     { showToast("Site Name is required.", "error"); return; }
    if (!location) { showToast("Location is required.", "error"); return; }
    if (!category) { showToast("Please select a Category.", "error"); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";

    // Build PATCH payload — exact HeritageSiteUpdate field names
    // Only send non-empty optional fields; send null to clear them
    const yearRaw = form.year_established.value;
    const latRaw  = form.latitude.value;
    const lonRaw  = form.longitude.value;

    const payload = {
      name,
      location,
      category,
      description:      form.description.value.trim()  || null,
      year_established: yearRaw  ? parseInt(yearRaw)   : null,
      significance:     form.significance.value.trim() || null,
      image_url:        form.image_url.value.trim()    || null,
      latitude:         latRaw   ? parseFloat(latRaw)  : null,
      longitude:        lonRaw   ? parseFloat(lonRaw)  : null,
    };

    try {
      const updated = await sitesApi.update(SITE_ID, payload);
      currentSite = updated;           // keep our reference fresh
      renderSiteInfo(updated);         // refresh displayed info immediately
      closeEditForm();
      showToast("Site updated successfully!", "success");
    } catch (err) {
      showToast(`Update failed: ${err.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  });
}

// ---------------------------------------------------------------------------
// Delete functionality
// ---------------------------------------------------------------------------
function initDelete(siteName) {
  const deleteBtn     = document.getElementById("btn-delete-site");
  const modal         = document.getElementById("delete-modal");
  const confirmBtn    = document.getElementById("btn-confirm-delete");
  const cancelDelBtn  = document.getElementById("btn-cancel-delete");
  const modalMsg      = document.getElementById("delete-modal-msg");

  function openModal() {
    modalMsg.textContent = `"${siteName}" will be permanently deleted. This action cannot be undone.`;
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  deleteBtn.addEventListener("click", openModal);
  cancelDelBtn.addEventListener("click", closeModal);

  // Close modal if user clicks the dark overlay (outside the box)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Deleting…";

    try {
      await sitesApi.remove(SITE_ID);
      showToast(`"${siteName}" deleted successfully.`, "success");
      // Redirect to sites list after short delay so toast is readable
      setTimeout(() => {
        window.location.href = "sites.html";
      }, 1200);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Yes, Delete";
      closeModal();
    }
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const site = await loadSiteDetail();
  if (site) {
    initEdit(site);
    initDelete(site.name);
  }
});
