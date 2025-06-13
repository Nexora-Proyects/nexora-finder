// DOM Elements
const userInfo = document.getElementById("userInfo");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const userTime = document.getElementById("userTime");
const userAvatar = document.getElementById("userAvatar");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadUserData();
  setupAnimations();
  addInteractivity();
});

// Logout function
function logout() {
  localStorage.clear();

  // Show logout message
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Sesión cerrada", {
      body: "Has cerrado sesión exitosamente",
      icon: "../../../assets/Logo.png",
    });
  }

  // Redirect to login
  setTimeout(() => {
    window.location.href = "../auth/login.html";
  }, 500);
}

// Redirect to login
function redirectToLogin() {
  window.location.href = "../auth/login.html";
}

// Setup animations
function setupAnimations() {
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
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

// Add interactivity
function addInteractivity() {
  // Feature cards hover effect
  const featureCards = document.querySelectorAll(".feature-card");

  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px) scale(1.02)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });
  });

  // Quick action buttons
  const quickActionBtns = document.querySelectorAll(".quick-action-btn");

  quickActionBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Add click animation
      btn.style.transform = "scale(0.95)";
      setTimeout(() => {
        btn.style.transform = "scale(1)";
      }, 150);
    });
  });

  // Stats cards animation
  const statCards = document.querySelectorAll(".stat-card");

  statCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add("slide-up");
  });
}

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K for quick search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    window.location.href = "../finder/finder.html";
  }

  // Ctrl/Cmd + T for tools
  if ((e.ctrlKey || e.metaKey) && e.key === "t") {
    e.preventDefault();
    window.location.href = "../tools/tools.html";
  }

  // Ctrl/Cmd + , for settings
  if ((e.ctrlKey || e.metaKey) && e.key === ",") {
    e.preventDefault();
    window.location.href = "../settings/settings.html";
  }
});
