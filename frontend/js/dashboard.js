/**
 * dashboard.js — Logic for the Dashboard page (index.html).
 * Imports from api.js; never calls fetch() directly.
 */

import { sitesApi, maintenanceApi, visitorsApi, showToast } from "./api.js";

async function loadDashboard() {
  try {
    const [sites, maintenance, visitors] = await Promise.all([
      sitesApi.getAll(0, 200),
      maintenanceApi.getAll(0, 200),
      visitorsApi.getAll(0, 200),
    ]);

    // --- Stat counters ---
    document.getElementById("stat-sites-count").textContent       = sites.length;
    document.getElementById("stat-maintenance-count").textContent = maintenance.length;
    document.getElementById("stat-visitors-count").textContent    = visitors.length;

    const pending = maintenance.filter(r => r.status === "Pending").length;
    document.getElementById("stat-pending-count").textContent     = pending;

    // --- Recent sites table ---
    const tbody = document.getElementById("recent-sites-body");
    tbody.innerHTML = "";

    const recent = sites.slice(-5).reverse();

    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No heritage sites found. <a href="pages/add-site.html">Add one →</a></td></tr>';
      return;
    }

    recent.forEach((site, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${site.name}</td>
        <td>${site.location}</td>
        <td><span class="badge badge-info">${site.category}</span></td>
        <td><a href="pages/site-detail.html?id=${site.id}" class="btn btn-outline" style="padding:4px 10px;font-size:0.75rem;">View</a></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    showToast("Could not load dashboard data. Is the backend running?", "error");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
