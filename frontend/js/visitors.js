/**
 * visitors.js — Visitor Records page logic.
 * Handles table loading, total counter, Add form, Edit modal, and Delete confirmation.
 */

import { visitorsApi, sitesApi, showToast } from "./api.js";

// ---------------------------------------------------------------------------
// Table loader + total counter — now renders Edit + Delete buttons per row
// ---------------------------------------------------------------------------
async function loadVisitors() {
  const tbody = document.getElementById("visitors-body");
  try {
    const records = await visitorsApi.getAll();
    tbody.innerHTML = "";

    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No visitor records yet.</td></tr>';
      updateTotal(0);
      return;
    }

    let totalVisitors = 0;
    records.forEach(rec => {
      totalVisitors += rec.visitor_count;
      const tr = document.createElement("tr");
      // Store the full record on the row so edit/delete handlers can read it
      tr.dataset.record = JSON.stringify(rec);
      tr.innerHTML = `
        <td>${rec.id}</td>
        <td>${rec.site_id}</td>
        <td>${rec.visit_date}</td>
        <td>${rec.visitor_count.toLocaleString()}</td>
        <td>${rec.visitor_type ?? "—"}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-outline btn-edit-v"   data-id="${rec.id}"
                  style="font-size:0.75rem;padding:4px 10px;margin-right:4px;">Edit</button>
          <button class="btn btn-danger  btn-delete-v" data-id="${rec.id}"
                  style="font-size:0.75rem;padding:4px 10px;">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    updateTotal(totalVisitors);
  } catch (err) {
    showToast("Failed to load visitor records.", "error");
    console.error(err);
  }
}

function updateTotal(value) {
  const totalEl = document.getElementById("total-visitors");
  if (totalEl) totalEl.textContent = value.toLocaleString();
}

// ---------------------------------------------------------------------------
// Populate Heritage Site dropdown (used by Add form)
// ---------------------------------------------------------------------------
async function populateSiteDropdown(selectId) {
  const select = document.getElementById(selectId);
  try {
    const sites = await sitesApi.getAll();
    select.innerHTML = '<option value="">— Select a site —</option>';
    sites.forEach(site => {
      const opt = document.createElement("option");
      opt.value = site.id;
      opt.textContent = site.name;
      select.appendChild(opt);
    });
  } catch (err) {
    select.innerHTML = '<option value="">— Could not load sites —</option>';
    console.error("Failed to load sites for dropdown:", err);
  }
}

// ---------------------------------------------------------------------------
// Add form toggle (unchanged)
// ---------------------------------------------------------------------------
function initToggle() {
  const toggleBtn = document.getElementById("btn-toggle-visitor-form");
  const cancelBtn = document.getElementById("btn-cancel-visitor");
  const formPanel = document.getElementById("visitor-form-panel");

  function openForm() {
    formPanel.style.display = "block";
    toggleBtn.textContent = "Close Form";
    populateSiteDropdown("v-site-id");
  }

  function closeForm() {
    formPanel.style.display = "none";
    toggleBtn.textContent = "Add Visitor Record";
    document.getElementById("add-visitor-form").reset();
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = formPanel.style.display !== "none";
    isOpen ? closeForm() : openForm();
  });

  cancelBtn.addEventListener("click", closeForm);
}

// ---------------------------------------------------------------------------
// Add form submission (unchanged)
// ---------------------------------------------------------------------------
function initForm() {
  const form = document.getElementById("add-visitor-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const siteId       = form.site_id.value;
    const visitDate    = form.visit_date.value;
    const visitorCount = form.visitor_count.value;

    if (!siteId)                                       { showToast("Please select a Heritage Site.", "error"); return; }
    if (!visitDate)                                    { showToast("Visit Date is required.", "error"); return; }
    if (visitorCount === "" || parseInt(visitorCount) < 0) { showToast("Visitor Count must be 0 or greater.", "error"); return; }

    const submitBtn = document.getElementById("v-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";

    const payload = {
      site_id:       parseInt(siteId),
      visit_date:    visitDate,
      visitor_count: parseInt(visitorCount),
      visitor_type:  form.visitor_type.value || null,
      notes:         form.notes.value.trim() || null,
    };

    try {
      await visitorsApi.create(payload);
      showToast("Visitor record added successfully!", "success");
      form.reset();
      document.getElementById("visitor-form-panel").style.display = "none";
      document.getElementById("btn-toggle-visitor-form").textContent = "Add Visitor Record";
      await loadVisitors();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Record";
    }
  });
}

// ---------------------------------------------------------------------------
// Edit modal — uses exact VisitorUpdate field names
// ---------------------------------------------------------------------------
function initEditModal() {
  const modal     = document.getElementById("v-edit-modal");
  const form      = document.getElementById("edit-visitor-form");
  const cancelBtn = document.getElementById("ev-cancel-btn");
  const submitBtn = document.getElementById("ev-submit-btn");
  let activeId    = null;

  function openModal(rec) {
    activeId = rec.id;
    // Populate with current values — VisitorUpdate fields only
    form.visit_date.value    = rec.visit_date    ?? "";
    form.visitor_count.value = rec.visitor_count ?? "";
    form.visitor_type.value  = rec.visitor_type  ?? "";
    form.notes.value         = rec.notes         ?? "";
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
    form.reset();
    activeId = null;
  }

  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const countRaw = form.visitor_count.value;
    if (countRaw === "" || parseInt(countRaw) < 0) {
      showToast("Visitor Count must be 0 or greater.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";

    // Build PATCH payload using exact VisitorUpdate field names
    const payload = {
      visit_date:    form.visit_date.value    || null,
      visitor_count: parseInt(countRaw),
      visitor_type:  form.visitor_type.value  || null,
      notes:         form.notes.value.trim()  || null,
    };

    try {
      await visitorsApi.update(activeId, payload);
      showToast("Visitor record updated!", "success");
      closeModal();
      await loadVisitors();           // refreshes table + total
    } catch (err) {
      showToast(`Update failed: ${err.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  });

  return openModal;
}

// ---------------------------------------------------------------------------
// Delete modal
// ---------------------------------------------------------------------------
function initDeleteModal() {
  const modal      = document.getElementById("v-delete-modal");
  const msgEl      = document.getElementById("v-delete-modal-msg");
  const confirmBtn = document.getElementById("v-confirm-delete-btn");
  const cancelBtn  = document.getElementById("v-cancel-delete-btn");
  let activeId     = null;

  function openModal(id, visitDate) {
    activeId = id;
    msgEl.textContent = `Visitor record #${id} (${visitDate}) will be permanently deleted. This cannot be undone.`;
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
    activeId = null;
  }

  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Deleting…";

    try {
      await visitorsApi.remove(activeId);
      showToast("Visitor record deleted.", "success");
      closeModal();
      await loadVisitors();           // refreshes table + recalculates total
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Yes, Delete";
    }
  });

  return openModal;
}

// ---------------------------------------------------------------------------
// Wire edit/delete button clicks via event delegation on tbody
// ---------------------------------------------------------------------------
function initTableActions(openEditModal, openDeleteModal) {
  const tbody = document.getElementById("visitors-body");

  tbody.addEventListener("click", (e) => {
    const editBtn   = e.target.closest(".btn-edit-v");
    const deleteBtn = e.target.closest(".btn-delete-v");

    if (editBtn) {
      const row = editBtn.closest("tr");
      const rec = JSON.parse(row.dataset.record);
      openEditModal(rec);
    }

    if (deleteBtn) {
      const row = deleteBtn.closest("tr");
      const rec = JSON.parse(row.dataset.record);
      openDeleteModal(rec.id, rec.visit_date);
    }
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadVisitors();
  initToggle();
  initForm();
  const openEditModal   = initEditModal();
  const openDeleteModal = initDeleteModal();
  initTableActions(openEditModal, openDeleteModal);
});
