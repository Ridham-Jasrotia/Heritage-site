/**
 * dashboard.js — Logic for the Dashboard page (index.html).
 * Imports from api.js & auth.js.
 */

import { sitesApi, maintenanceApi, visitorsApi, showToast } from "./api.js";
import { initAuthGuard } from "./auth.js";

const DEFAULT_MONUMENT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1200px-Taj_Mahal_%28Edited%29.jpeg";

async function loadDashboard() {
  initAuthGuard();

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

    // --- Featured Heritage Sites Grid ---
    const featuredGrid = document.getElementById("featured-sites-grid");
    if (featuredGrid) {
      featuredGrid.innerHTML = "";
      // Select sites that have image_url or first 3 sites
      const featured = sites.filter(s => s.image_url && s.image_url.startsWith("http")).slice(0, 3);
      const displayFeatured = featured.length >= 3 ? featured : sites.slice(0, 3);

      if (displayFeatured.length === 0) {
        featuredGrid.innerHTML = '<p class="loading-cell">No featured sites available.</p>';
      } else {
        displayFeatured.forEach(site => {
          const card = document.createElement("div");
          card.className = "featured-site-card";
          const imgUrl = site.image_url || DEFAULT_MONUMENT_IMAGE;
          card.innerHTML = `
            <div class="featured-img-wrap">
              <img src="${imgUrl}" alt="${site.name}" loading="lazy" onerror="this.onerror=null;this.src='${DEFAULT_MONUMENT_IMAGE}';" />
              <span class="featured-badge">${site.category}</span>
            </div>
            <div class="featured-card-body">
              <h3 class="featured-title">${site.name}</h3>
              <p class="featured-location">${site.location}</p>
              <a href="pages/site-detail.html?id=${site.id}" class="btn btn-outline featured-btn">View Details</a>
            </div>
          `;
          featuredGrid.appendChild(card);
        });
      }
    }

    // --- Recent sites table ---
    const tbody = document.getElementById("recent-sites-body");
    if (tbody) {
      tbody.innerHTML = "";
      const recent = sites.slice(-5).reverse();

      if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No heritage sites found. <a href="pages/add-site.html">Add site</a></td></tr>';
        return;
      }

      recent.forEach((site, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td><strong>${site.name}</strong></td>
          <td>${site.location}</td>
          <td><span class="badge badge-info">${site.category}</span></td>
          <td><a href="pages/site-detail.html?id=${site.id}" class="btn btn-outline" style="padding:4px 10px;font-size:0.75rem;">View Details</a></td>
        `;
        tbody.appendChild(tr);
      });
    }

  } catch (err) {
    if (!err.message.includes("Session expired")) {
      showToast("Could not load dashboard data.", "error");
    }
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
