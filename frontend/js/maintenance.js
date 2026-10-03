/**
 * maintenance.js — Maintenance Records page logic.
 * Handles table loading, Add form, Edit modal, and Delete confirmation.
 */

import { maintenanceApi, sitesApi, showToast } from "./api.js";
import { initAuthGuard } from "./auth.js";

const STATUS_BADGE = {
  "Pending":     "badge-warning",
  "In Progress": "badge-info",
  "Completed":   "badge-success",
};

const PRIORITY_BADGE = {
  "Low":    "badge-success",
  "Medium": "badge-info",
  "High":   "badge-danger",
};

async function loadMaintenance() {
  const tbody = document.getElementById("maintenance-body");
  try {
    const records = await maintenanceApi.getAll();
    tbody.innerHTML = "";

    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No maintenance records yet.</td></tr>';
      return;
    }

    records.forEach(rec => {
      const sBadge = STATUS_BADGE[rec.status]     || "badge-info";
      const pBadge = PRIORITY_BADGE[rec.priority] || "badge-info";
      const tr = document.createElement("tr");
      tr.dataset.record = JSON.stringify(rec);
      tr.innerHTML = `
        <td>${rec.id}</td>
        <td><strong>${rec.title}</strong></td>
        <td>Site #${rec.site_id}</td>
        <td><span class="badge ${sBadge}">${rec.status}</span></td>
        <td><span class="badge ${pBadge}">${rec.priority}</span></td>
        <td>${rec.scheduled_date ?? "—"}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-outline btn-edit-m"   data-id="${rec.id}"
                  style="font-size:0.75rem;padding:4px 10px;margin-right:4px;">Edit</button>
          <button class="btn btn-danger  btn-delete-m" data-id="${rec.id}"
                  style="font-size:0.75rem;padding:4px 10px;">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    if (!err.message.includes("Session expired")) {
      showToast("Failed to load maintenance records.", "error");
    }
    console.error(err);
  }
}

async function populateSiteDropdown(selectId) {
  const select = document.getElementById(selectId);
  try {
    const sites = await sitesApi.getAll();
    select.innerHTML = '<option value="">— Select a site —</option>';
    sites.forEach(site => {
      const opt = document.createElement("option");
      opt.value = site.id;
      opt.textContent = `${site.name} (${site.location})`;
      select.appendChild(opt);
    });
  } catch (err) {
    select.innerHTML = '<option value="">— Could not load sites —</option>';
    console.error("Failed to load sites for dropdown:", err);
  }
}

function initToggle() {
  const toggleBtn = document.getElementById("btn-toggle-maintenance-form");
  const cancelBtn = document.getElementById("btn-cancel-maintenance");
  const formPanel = document.getElementById("maintenance-form-panel");

  function openForm() {
    formPanel.style.display = "block";
    toggleBtn.textContent = "Close Form";
    populateSiteDropdown("m-site-id");
  }

  function closeForm() {
    formPanel.style.display = "none";
    toggleBtn.textContent = "Add Maintenance Record";
    document.getElementById("add-maintenance-form").reset();
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = formPanel.style.display !== "none";
    isOpen ? closeForm() : openForm();
  });

  cancelBtn.addEventListener("click", closeForm);
}

function initForm() {
  const form = document.getElementById("add-maintenance-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const siteId = form.site_id.value;
    const title  = form.title.value.trim();

    if (!siteId) { showToast("Please select a Heritage Site.", "error"); return; }
    if (!title)  { showToast("Title is required.", "error"); return; }

    const submitBtn = document.getElementById("m-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";

    const scheduledRaw = form.scheduled_date.value;
    const payload = {
      site_id:        parseInt(siteId),
      title,
      description:    form.description.value.trim() || null,
      status:         form.status.value,
      priority:       form.priority.value,
      scheduled_date: scheduledRaw || null,
      completed_date: null,
    };

    try {
      await maintenanceApi.create(payload);
      showToast("Maintenance record added successfully!", "success");
      form.reset();
      document.getElementById("maintenance-form-panel").style.display = "none";
      document.getElementById("btn-toggle-maintenance-form").textContent = "Add Maintenance Record";
      await loadMaintenance();
    } catch (err) {
      if (!err.message.includes("Session expired")) {
        showToast(`Error: ${err.message}`, "error");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Record";
    }
  });
}

function initEditModal() {
  const modal      = document.getElementById("m-edit-modal");
  const form       = document.getElementById("edit-maintenance-form");
  const cancelBtn  = document.getElementById("em-cancel-btn");
  const submitBtn  = document.getElementById("em-submit-btn");
  let activeId     = null;

  function openModal(rec) {
    activeId = rec.id;
    form.title.value          = rec.title          ?? "";
    form.status.value         = rec.status         ?? "Pending";
    form.priority.value       = rec.priority       ?? "Medium";
    form.scheduled_date.value = rec.scheduled_date ?? "";
    form.completed_date.value = rec.completed_date ?? "";
    form.description.value    = rec.description    ?? "";
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

    const title = form.title.value.trim();
    if (!title) { showToast("Title is required.", "error"); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving…";

    const scheduledRaw  = form.scheduled_date.value;
    const completedRaw  = form.completed_date.value;

    const payload = {
      title,
      description:    form.description.value.trim() || null,
      status:         form.status.value,
      priority:       form.priority.value,
      scheduled_date: scheduledRaw || null,
      completed_date: completedRaw || null,
    };

    try {
      await maintenanceApi.update(activeId, payload);
      showToast("Maintenance record updated!", "success");
      closeModal();
      await loadMaintenance();
    } catch (err) {
      showToast(`Update failed: ${err.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  });

  return openModal;
}

function initDeleteModal() {
  const modal      = document.getElementById("m-delete-modal");
  const msgEl      = document.getElementById("m-delete-modal-msg");
  const confirmBtn = document.getElementById("m-confirm-delete-btn");
  const cancelBtn  = document.getElementById("m-cancel-delete-btn");
  let activeId     = null;

  function openModal(id, title) {
    activeId = id;
    msgEl.textContent = `Record "${title}" will be permanently deleted. This action cannot be undone.`;
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
      await maintenanceApi.remove(activeId);
      showToast("Record deleted.", "success");
      closeModal();
      await loadMaintenance();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Yes, Delete";
    }
  });

  return openModal;
}

function initTableActions(openEditModal, openDeleteModal) {
  const tbody = document.getElementById("maintenance-body");

  tbody.addEventListener("click", (e) => {
    const editBtn   = e.target.closest(".btn-edit-m");
    const deleteBtn = e.target.closest(".btn-delete-m");

    if (editBtn) {
      const row = editBtn.closest("tr");
      const rec = JSON.parse(row.dataset.record);
      openEditModal(rec);
    }

    if (deleteBtn) {
      const row = deleteBtn.closest("tr");
      const rec = JSON.parse(row.dataset.record);
      openDeleteModal(rec.id, rec.title);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthGuard();
  loadMaintenance();
  initToggle();
  initForm();
  const openEditModal   = initEditModal();
  const openDeleteModal = initDeleteModal();
  initTableActions(openEditModal, openDeleteModal);
});
