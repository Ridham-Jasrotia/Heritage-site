/**
 * sites.js — Heritage Sites listing page logic.
 * Fetches all sites once on load, then filters client-side on every
 * search/filter change — zero extra API requests.
 */

import { sitesApi, showToast } from "./api.js";

// ---------------------------------------------------------------------------
// Module-level cache — all sites loaded from the API
// ---------------------------------------------------------------------------
let allSites = [];

// ---------------------------------------------------------------------------
// Build a single site card element (unchanged card structure from original)
// ---------------------------------------------------------------------------
function buildCard(site) {
  const card = document.createElement("div");
  card.className = "site-card";
  card.innerHTML = `
    <div class="site-card-body">
      <p class="site-card-meta">${site.category}</p>
      <h3 class="site-card-title">${site.name}</h3>
      <p class="site-card-meta">${site.location}</p>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <a href="site-detail.html?id=${site.id}" class="btn btn-primary"
           style="font-size:0.8rem;padding:6px 12px;">View Details</a>
      </div>
    </div>
  `;
  return card;
}

// ---------------------------------------------------------------------------
// Render the filtered subset into the grid
// ---------------------------------------------------------------------------
function renderGrid(sites) {
  const grid      = document.getElementById("sites-grid");
  const countEl   = document.getElementById("sites-results-count");

  grid.innerHTML = "";

  if (sites.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sites-empty-state";
    empty.innerHTML = `
      <p style="font-size:2rem;margin-bottom:8px;">🔍</p>
      <p>No heritage sites found.</p>
      <p style="margin-top:4px;font-size:0.8rem;">Try adjusting your search or filters.</p>
    `;
    grid.appendChild(empty);
    countEl.textContent = "No results";
    return;
  }

  sites.forEach(site => grid.appendChild(buildCard(site)));
  countEl.textContent = `Showing ${sites.length} of ${allSites.length} site${allSites.length !== 1 ? "s" : ""}`;
}

// ---------------------------------------------------------------------------
// Populate category dropdown from actual data (deduped, sorted)
// ---------------------------------------------------------------------------
function populateCategoryFilter(sites) {
  const select = document.getElementById("site-category-filter");
  const categories = [...new Set(sites.map(s => s.category).filter(Boolean))].sort();

  // Keep "All Categories" first option
  select.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// ---------------------------------------------------------------------------
// Apply current search + category filter values against allSites
// ---------------------------------------------------------------------------
function applyFilters() {
  const query    = document.getElementById("site-search").value.trim().toLowerCase();
  const category = document.getElementById("site-category-filter").value;
  const clearBtn = document.getElementById("site-filter-clear");

  const isActive = query !== "" || category !== "";
  clearBtn.style.display = isActive ? "inline-flex" : "none";

  const filtered = allSites.filter(site => {
    // Category filter (exact match)
    if (category && site.category !== category) return false;

    // Text search — match name, location, or category (case-insensitive)
    if (query) {
      const haystack = [site.name, site.location, site.category]
        .map(v => (v ?? "").toLowerCase())
        .join(" ");
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  renderGrid(filtered);
}

// ---------------------------------------------------------------------------
// Load all sites from API once, then wire up filters
// ---------------------------------------------------------------------------
async function loadSites() {
  const grid = document.getElementById("sites-grid");
  grid.innerHTML = '<p class="loading-cell">Loading…</p>';

  try {
    allSites = await sitesApi.getAll();

    if (allSites.length === 0) {
      grid.innerHTML = '<p class="loading-cell">No heritage sites yet. <a href="add-site.html">Add the first one →</a></p>';
      document.getElementById("sites-results-count").textContent = "";
      return;
    }

    populateCategoryFilter(allSites);
    renderGrid(allSites);   // show all by default

    // Wire up filter controls
    const searchInput  = document.getElementById("site-search");
    const categorySel  = document.getElementById("site-category-filter");
    const clearBtn     = document.getElementById("site-filter-clear");

    searchInput.addEventListener("input",  applyFilters);
    categorySel.addEventListener("change", applyFilters);

    clearBtn.addEventListener("click", () => {
      searchInput.value  = "";
      categorySel.value  = "";
      clearBtn.style.display = "none";
      renderGrid(allSites);
      document.getElementById("sites-results-count").textContent = "";
    });

  } catch (err) {
    showToast("Failed to load sites.", "error");
    grid.innerHTML = '<p class="loading-cell">Failed to load sites.</p>';
    console.error(err);
  }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", loadSites);
