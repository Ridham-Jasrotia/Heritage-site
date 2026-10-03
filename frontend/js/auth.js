/**
 * auth.js — Frontend Authentication Guard & Session Management.
 * Protects pages and handles logout.
 */

export function getLoginPath() {
  const isPagesFolder = window.location.pathname.includes("/pages/");
  return isPagesFolder ? "login.html" : "pages/login.html";
}

export function getDashboardPath() {
  const isPagesFolder = window.location.pathname.includes("/pages/");
  return isPagesFolder ? "../index.html" : "index.html";
}

export function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = getLoginPath();
    return false;
  }
  return true;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = getLoginPath();
}

export function initAuthGuard() {
  if (!requireAuth()) return;

  // Wire up logout button if present in sidebar
  const logoutBtn = document.getElementById("nav-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}
