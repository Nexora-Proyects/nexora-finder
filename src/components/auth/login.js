// DOM Elements
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const messageBox = document.getElementById("messageBox");
const loginBtn = document.querySelector(".login-btn");
const btnText = document.querySelector(".btn-text");
const btnLoader = document.querySelector(".btn-loader");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  attemptAutoLogin();
  addInputAnimations();
});

// Setup event listeners
function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);
  togglePassword.addEventListener("click", togglePasswordVisibility);

  // Input focus animations
  const inputs = document.querySelectorAll(".input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement.style.transform = "scale(1.02)";
    });

    input.addEventListener("blur", () => {
      input.parentElement.style.transform = "scale(1)";
    });
  });
}

// Toggle password visibility
function togglePasswordVisibility() {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  const icon = togglePassword.querySelector("i");
  icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
}

// Show message
function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = "block";

  // Auto hide after 5 seconds
  setTimeout(() => {
    messageBox.style.display = "none";
  }, 5000);
}

// Set loading state
function setLoadingState(loading) {
  loginBtn.disabled = loading;
  btnText.style.display = loading ? "none" : "inline";
  btnLoader.style.display = loading ? "inline-flex" : "none";
}

// Auto login attempt
async function attemptAutoLogin() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return;

  try {
    const response = await fetch(
      "https://auth.minecloud.lol/api/v1/refresh-token",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      showMessage("✅ Autologin exitoso", "success");

      setTimeout(() => {
        window.location.href = "../main/index.html";
      }, 1500);
    }
  } catch (error) {}
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Validation
  const usernameRegex = /^[a-zA-Z0-9_-]{1,24}$/;
  const passwordRegex = /^[a-zA-Z0-9_-]{1,24}$/;

  if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
    showMessage("❌ Usuario o contraseña inválidos", "error");
    return;
  }

  setLoadingState(true);

  try {
    const response = await fetch("https://auth.minecloud.lol/api/v1/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error en el login");
    }

    const data = await response.json();

    // Store tokens
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    showMessage("✅ Login exitoso", "success");

    // Redirect after success
    setTimeout(() => {
      window.location.href = "../main/index.html";
    }, 1500);
  } catch (error) {
    showMessage(`❌ ${error.message}`, "error");
  } finally {
    setLoadingState(false);
  }
}

// Add input animations
function addInputAnimations() {
  const inputs = document.querySelectorAll(".input");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (input.value) {
        input.style.borderColor = "var(--accent-blue)";
      } else {
        input.style.borderColor = "var(--border-color)";
      }
    });
  });
}

// Notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}
