// DOM Elements
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".settings-section");
const passwordForm = document.getElementById("passwordForm");
const togglePasswordBtns = document.querySelectorAll(".toggle-password");
const newPasswordInput = document.getElementById("newPassword");
const passwordStrength = document.getElementById("passwordStrength");
const profileUsername = document.getElementById("profileUsername");
const profileRole = document.getElementById("profileRole");
const profileTime = document.getElementById("profileTime");
const profileAvatar = document.getElementById("profileAvatar");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupPasswordForm();
  setupToggleButtons();
  fetchAndUpdateTime();
  loadUserProfile();
  setupPreferences();
});

// Setup navigation
function setupNavigation() {
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetSection = item.dataset.section;

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Show target section
      sections.forEach((section) => section.classList.remove("active"));
      document.getElementById(targetSection).classList.add("active");

      // Add animation
      const activeSection = document.getElementById(targetSection);
      activeSection.style.opacity = "0";
      activeSection.style.transform = "translateY(20px)";

      setTimeout(() => {
        activeSection.style.opacity = "1";
        activeSection.style.transform = "translateY(0)";
      }, 100);
    });
  });
}

// Setup password form
function setupPasswordForm() {
  passwordForm.addEventListener("submit", handlePasswordChange);

  // Password strength checker
  newPasswordInput.addEventListener("input", checkPasswordStrength);
}

// Setup toggle password buttons
function setupToggleButtons() {
  togglePasswordBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const targetInput = document.getElementById(targetId);
      const icon = btn.querySelector("i");

      if (targetInput.type === "password") {
        targetInput.type = "text";
        icon.className = "fas fa-eye-slash";
      } else {
        targetInput.type = "password";
        icon.className = "fas fa-eye";
      }
    });
  });
}

// Update User
async function fetchAndUpdateTime() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("Token no disponible");
    return;
  }

  try {
    const response = await fetch(
      "https://auth.minecloud.lol/api/v1/update-time",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      profileUsername.textContent = data.name;
      profileRole.textContent = data.role;
      profileTime.textContent = data.time;
      profileAvatar.src = `https://mc-heads.net/avatar/${data.name}`;

      // Guarda los datos actualizados en localStorage
      localStorage.setItem("name", data.name);
      localStorage.setItem("role", data.role);
      localStorage.setItem("time", data.time);
    } else {
      console.error("Error al obtener datos:", data.message);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

// Load user profile
function loadUserProfile() {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const time = localStorage.getItem("time");

  profileUsername.textContent = name;
  profileRole.textContent = role;
  profileTime.textContent = time;
  profileAvatar.src = `https://mc-heads.net/avatar/${name}`;
}

// Check password strength
function checkPasswordStrength() {
  const password = newPasswordInput.value;
  const strengthIndicator = passwordStrength;

  if (password.length === 0) {
    strengthIndicator.style.display = "none";
    return;
  }

  let strength = 0;
  let feedback = "";

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  // Determine strength level
  if (strength < 3) {
    strengthIndicator.className = "password-strength weak";
    feedback =
      "⚠️ Contraseña débil - Usa al menos 8 caracteres con mayúsculas, minúsculas y números";
  } else if (strength < 5) {
    strengthIndicator.className = "password-strength medium";
    feedback = "🔶 Contraseña media - Considera agregar caracteres especiales";
  } else {
    strengthIndicator.className = "password-strength strong";
    feedback = "✅ Contraseña fuerte";
  }

  strengthIndicator.textContent = feedback;
}

// Handle password change
async function handlePasswordChange(event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const username = localStorage.getItem("name");
  const token = localStorage.getItem("access_token");

  // Validation
  const passwordRegex = /^[a-zA-Z0-9_-]{1,24}$/;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    showModal("Error", "❌ Las contraseñas contienen caracteres inválidos");
    return;
  }

  if (newPassword !== confirmPassword) {
    showModal("Error", "❌ Las contraseñas no coinciden");
    return;
  }

  if (newPassword.length < 6) {
    showModal(
      "Error",
      "❌ La nueva contraseña debe tener al menos 6 caracteres"
    );
    return;
  }

  if (!username || !token) {
    showModal("Error", "❌ Token inválido");
    return;
  }

  // Set loading state
  const submitBtn = passwordForm.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");

  submitBtn.disabled = true;
  btnText.style.display = "none";
  btnLoader.style.display = "inline-flex";

  try {
    const response = await fetch(
      "https://auth.minecloud.lol/api/v1/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      showModal(
        "Éxito",
        `✅ ${data.message || "Contraseña cambiada exitosamente"}`
      );
      passwordForm.reset();
      passwordStrength.style.display = "none";
    } else {
      showModal(
        "Error",
        `❌ ${data.message || "Error al cambiar la contraseña"}`
      );
    }
  } catch (error) {
    showModal("Error", "⚠️ Api Off/Maintenaince");
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
}

// Setup preferences
function setupPreferences() {
  const preferences = {
    browserNotifications:
      localStorage.getItem("browserNotifications") !== "false",
    notificationSounds: localStorage.getItem("notificationSounds") === "true",
    animations: localStorage.getItem("animations") !== "false",
  };

  // Set initial states
  Object.keys(preferences).forEach((key) => {
    const checkbox = document.getElementById(key);
    if (checkbox) {
      checkbox.checked = preferences[key];

      checkbox.addEventListener("change", () => {
        localStorage.setItem(key, checkbox.checked);

        // Handle specific preferences
        if (key === "browserNotifications" && checkbox.checked) {
          requestNotificationPermission();
        }

        if (key === "animations") {
          document.body.style.setProperty(
            "--animation-duration",
            checkbox.checked ? "0.3s" : "0s"
          );
        }

        showNotification(
          "Preferencia actualizada",
          `${getPreferenceName(key)} ${
            checkbox.checked ? "activado" : "desactivado"
          }`
        );
      });
    }
  });
}

// Get preference display name
function getPreferenceName(key) {
  const names = {
    browserNotifications: "Notificaciones del navegador",
    notificationSounds: "Sonidos de notificación",
    animations: "Animaciones",
  };
  return names[key] || key;
}

// Request notification permission
function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("¡Notificaciones activadas!", {
          body: "Ahora recibirás notificaciones de Nexora Finder",
          icon: "../../../assets/Logo.png",
        });
      }
    });
  }
}

// Show modal
function showModal(title, message) {
  const modal = document.getElementById("messageModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.style.display = "flex";

  // Auto close after 5 seconds
  setTimeout(() => {
    closeModal();
  }, 5000);
}

// Close modal
function closeModal() {
  const modal = document.getElementById("messageModal");
  modal.style.display = "none";
}

// Show notification
function showNotification(title, body) {
  const browserNotifications =
    localStorage.getItem("browserNotifications") !== "false";

  if (
    browserNotifications &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification(title, {
      body,
      icon: "../../../assets/Logo.png",
    });
  }
}

// Close modal when clicking outside
document.getElementById("messageModal").addEventListener("click", (e) => {
  if (e.target.id === "messageModal") {
    closeModal();
  }
});
