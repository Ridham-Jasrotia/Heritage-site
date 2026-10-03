/**
 * sites.js — Heritage Sites listing page logic.
 * Client-side search and category filtering with monument images.
 */

import { sitesApi, showToast } from "./api.js";
import { initAuthGuard } from "./auth.js";

const DEFAULT_MONUMENT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1200px-Taj_Mahal_%28Edited%29.jpeg";

let allSites = [];

/**
 * Build a single site card element with image, details and action
 */
function buildCard(site) {
  const card = document.createElement("div");
  card.className = "site-card";
  const imgUrl = site.image_url || DEFAULT_MONUMENT_IMAGE;
  const descriptionSnippet = site.description
    ? (site.description.length > 110 ? site.description.substring(0, 110) + "…" : site.description)
    : "No description available.";

  card.innerHTML = `
    <div class="site-card-img-wrap">
      <img src="${imgUrl}" alt="${site.name}" loading="lazy" onerror="this.onerror=null;this.src='${DEFAULT_MONUMENT_IMAGE}';" />
      <span class="site-card-badge">${site.category}</span>
    </div>
    <div class="site-card-body">
      <h3 class="site-card-title">${site.name}</h3>
      <p class="site-card-location">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${site.location}</span>
      </p>
      <p class="site-card-description">${descriptionSnippet}</p>
      <div class="site-card-footer">
        <a href="site-detail.html?id=${site.id}" class="btn btn-primary site-card-btn">View Details</a>
      </div>
    </div>
  `;
  return card;
}

/**
 * Render filtered subset into grid
 */
function renderGrid(sites) {
  const grid    = document.getElementById("sites-grid");
  const countEl = document.getElementById("sites-results-count");

  grid.innerHTML = "";

  if (sites.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sites-empty-state";
    empty.innerHTML = `
      <div class="empty-icon-wrap">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <p style="font-weight:600;font-size:1.05rem;color:var(--color-text);margin-bottom:4px;">No heritage sites found</p>
      <p style="font-size:0.85rem;color:var(--color-text-muted);">Try adjusting your search criteria or filter options.</p>
    `;
    grid.appendChild(empty);
    countEl.textContent = "No matching sites";
    return;
  }

  sites.forEach(site => grid.appendChild(buildCard(site)));
  countEl.textContent = `Showing ${sites.length} of ${allSites.length} site${allSites.length !== 1 ? "s" : ""}`;
}

/**
 * Populate category dropdown from actual dataset
 */
function populateCategoryFilter(sites) {
  const select = document.getElementById("site-category-filter");
  const categories = [...new Set(sites.map(s => s.category).filter(Boolean))].sort();

  select.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

/**
 * Apply active search and category filters
 */
function applyFilters() {
  const query    = document.getElementById("site-search").value.trim().toLowerCase();
  const category = document.getElementById("site-category-filter").value;
  const clearBtn = document.getElementById("site-filter-clear");

  const isActive = query !== "" || category !== "";
  clearBtn.style.display = isActive ? "inline-flex" : "none";

  const filtered = allSites.filter(site => {
    if (category && site.category !== category) return false;
    if (query) {
      const haystack = [site.name, site.location, site.category, site.description]
        .map(v => (v ?? "").toLowerCase())
        .join(" ");
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  renderGrid(filtered);
}

/**
 * Main initialization
 */
async function loadSites() {
  initAuthGuard();

  const grid = document.getElementById("sites-grid");
  grid.innerHTML = '<p class="loading-cell">Loading heritage sites…</p>';

  try {
    allSites = await sitesApi.getAll();

    if (allSites.length === 0) {
      grid.innerHTML = '<p class="loading-cell">No heritage sites available. <a href="add-site.html">Add New Site</a></p>';
      document.getElementById("sites-results-count").textContent = "";
      return;
    }

    populateCategoryFilter(allSites);
    renderGrid(allSites);

    const searchInput = document.getElementById("site-search");
    const categorySel = document.getElementById("site-category-filter");
    const clearBtn    = document.getElementById("site-filter-clear");

    searchInput.addEventListener("input",  applyFilters);
    categorySel.addEventListener("change", applyFilters);

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      categorySel.value = "";
      clearBtn.style.display = "none";
      renderGrid(allSites);
    });

  } catch (err) {
    if (!err.message.includes("Session expired")) {
      showToast("Failed to load sites.", "error");
    }
    grid.innerHTML = '<p class="loading-cell">Failed to load sites.</p>';
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadSites);
