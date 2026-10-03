/**
 * login.js — Handles authentication on login.html.
 */

const API_BASE = (window.location.protocol === "file:" || window.location.port === "5500")
  ? "http://127.0.0.1:8000/api"
  : "/api";

// SVG Icons for password toggle
const EYE_OPEN = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
`;

const EYE_OFF = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
`;

// Redirect if already logged in
function redirectIfAuthenticated() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "../index.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  redirectIfAuthenticated();

  const form        = document.getElementById("login-form");
  const alertEl     = document.getElementById("login-alert");
  const toggleBtn   = document.getElementById("toggle-password");
  const passInput   = document.getElementById("password");
  const submitBtn   = document.getElementById("login-btn");

  // Toggle password visibility
  if (toggleBtn && passInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passInput.type === "password";
      passInput.type = isPassword ? "text" : "password";
      toggleBtn.innerHTML = isPassword ? EYE_OFF : EYE_OPEN;
      toggleBtn.title = isPassword ? "Hide password" : "Show password";
    });
  }

  // Handle Login Form Submit
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      alertEl.style.display = "none";
      alertEl.textContent = "";

      const username = form.username.value.trim();
      const password = form.password.value;

      if (!username || !password) {
        alertEl.textContent = "Please enter both username and password.";
        alertEl.style.display = "block";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Authenticating…</span>";

      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ detail: "Login failed" }));
          throw new Error(errData.detail || "Invalid credentials.");
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", data.username);

        // Redirect to dashboard
        window.location.href = "../index.html";
      } catch (err) {
        alertEl.textContent = err.message || "Failed to authenticate.";
        alertEl.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "<span>Sign In</span>";
      }
    });
  }
});
