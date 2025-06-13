// DOM Elements
const connectionForm = document.getElementById("connectionForm");
const secretKeyInput = document.getElementById("secretKey");
const toggleKeyBtn = document.getElementById("toggleKey");
const connectionBtn = document.querySelector(".connection-btn");
const btnText = connectionBtn.querySelector(".btn-text");
const btnLoader = connectionBtn.querySelector(".btn-loader");
const connectionStatus = document.getElementById("connectionStatus");
const messageModal = document.getElementById("messageModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalIcon = document.getElementById("modalIcon");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  setupAnimations();
});

// Setup event listeners
function setupEventListeners() {
  connectionForm.addEventListener("submit", handleConnection);
  toggleKeyBtn.addEventListener("click", togglePasswordVisibility);

  // Input animations
  secretKeyInput.addEventListener("focus", () => {
    secretKeyInput.parentElement.style.transform = "scale(1.02)";
  });

  secretKeyInput.addEventListener("blur", () => {
    secretKeyInput.parentElement.style.transform = "scale(1)";
  });
}

// Toggle password visibility
function togglePasswordVisibility() {
  const type =
    secretKeyInput.getAttribute("type") === "password" ? "text" : "password";
  secretKeyInput.setAttribute("type", type);

  const icon = toggleKeyBtn.querySelector("i");
  icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
}

// Handle connection
async function handleConnection(event) {
  event.preventDefault();

  const secretKey = secretKeyInput.value.trim();
  const token = localStorage.getItem("access_token");

  if (!secretKey) {
    showModal("Error", "Por favor ingresa tu Secret Key", "error");
    return;
  }

  if (!token) {
    showModal("Error", "Token de acceso no válido", "error");
    return;
  }

  setLoadingState(true);

  try {
    const response = await fetch("https://bc.minecloud.lol/api/v4/store-info", {
      headers: {
        "X-Tebex-Secret": secretKey,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Store secret key
      localStorage.setItem("secret_key", secretKey);

      // Show success status
      showConnectionSuccess(data);

      // Show success modal
      showModal(
        "Conexión Exitosa",
        "Tu tienda ha sido conectada correctamente",
        "success"
      );

      // Redirect after delay
      setTimeout(() => {
        window.location.href = "buycraft/buycraft.html";
      }, 2000);
    } else {
      throw new Error("Secret Key inválida");
    }
  } catch (error) {
    console.error("Connection error:", error);
    showModal(
      "Error de Conexión",
      "Verifica tu Secret Key e intenta nuevamente",
      "error"
    );
  } finally {
    setLoadingState(false);
  }
}

// Set loading state
function setLoadingState(loading) {
  connectionBtn.disabled = loading;
  btnText.style.display = loading ? "none" : "flex";
  btnLoader.style.display = loading ? "inline-flex" : "none";
}

// Show connection success
function showConnectionSuccess(storeData) {
  connectionStatus.style.display = "flex";

  // Update status content if store data is available
  if (storeData && storeData.store_name) {
    const statusContent = connectionStatus.querySelector(".status-content");
    statusContent.innerHTML = `
      <h4>Conexión Exitosa</h4>
      <p>Conectado a: ${storeData.store_name}</p>
    `;
  }
}

// Show modal
function showModal(title, message, type = "info") {
  modalTitle.textContent = title;
  modalMessage.textContent = message;

  // Update modal icon based on type
  const iconElement = modalIcon.querySelector("i");
  modalIcon.className = `modal-icon ${type}`;

  switch (type) {
    case "success":
      iconElement.className = "fas fa-check-circle";
      break;
    case "error":
      iconElement.className = "fas fa-exclamation-triangle";
      break;
    default:
      iconElement.className = "fas fa-info-circle";
  }

  messageModal.style.display = "flex";

  // Auto close after 5 seconds for success messages
  if (type === "success") {
    setTimeout(() => {
      closeModal();
    }, 5000);
  }
}

// Close modal
function closeModal() {
  messageModal.style.display = "none";
}

// Setup animations
function setupAnimations() {
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, index * 200);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  // Observe elements with slide-up class
  document.querySelectorAll(".slide-up").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s ease-out";
    observer.observe(el);
  });
}

// Close modal when clicking outside
messageModal.addEventListener("click", (e) => {
  if (e.target === messageModal) {
    closeModal();
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Escape to close modal
  if (e.key === "Escape") {
    closeModal();
  }

  // Enter to submit form when input is focused
  if (e.key === "Enter" && document.activeElement === secretKeyInput) {
    connectionForm.dispatchEvent(new Event("submit"));
  }
});

// Show notification
function showNotification(title, body, type = "info") {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "../../../../assets/Logo.png",
    });
  }
}

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}
