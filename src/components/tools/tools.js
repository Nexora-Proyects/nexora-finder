// DOM Elements
const filterBtns = document.querySelectorAll(".filter-btn");
const toolCards = document.querySelectorAll(".tool-card");
const toolsCount = document.getElementById("toolsCount");
const comingSoonModal = document.getElementById("comingSoonModal");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  setupAnimations();
  updateToolsCount();
});

// Setup filter functionality
function setupFilters() {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      // Update active filter button
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Filter tools
      filterTools(filter);
      updateToolsCount(filter);
    });
  });
}

// Filter tools based on category
function filterTools(category) {
  toolCards.forEach((card) => {
    const cardCategory = card.dataset.category;

    if (category === "all" || cardCategory === category) {
      card.style.display = "flex";
      card.style.animation = "fadeInUp 0.6s ease-out";
    } else {
      card.style.display = "none";
    }
  });
}

// Update tools count
function updateToolsCount(filter = "all") {
  let count = 0;

  toolCards.forEach((card) => {
    const cardCategory = card.dataset.category;
    if (filter === "all" || cardCategory === filter) {
      count++;
    }
  });

  const categoryName =
    filter === "all"
      ? "herramientas"
      : `herramientas de ${getCategoryName(filter)}`;
  toolsCount.textContent = `${count} ${categoryName} disponibles`;
}

// Get category display name
function getCategoryName(category) {
  const names = {
    management: "gestión",
    security: "seguridad",
    analysis: "análisis",
  };
  return names[category] || category;
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
          }, index * 100);
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

  // Add hover effects to tool cards
  toolCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      if (!card.classList.contains("coming-soon")) {
        card.style.transform = "translateY(-12px) scale(1.02)";
      }
    });

    card.addEventListener("mouseleave", () => {
      if (!card.classList.contains("coming-soon")) {
        card.style.transform = "translateY(0) scale(1)";
      }
    });
  });
}

// Show coming soon modal
function showComingSoon() {
  comingSoonModal.style.display = "flex";

  // Auto close after 5 seconds
  setTimeout(() => {
    closeModal();
  }, 5000);
}

// Close modal
function closeModal() {
  comingSoonModal.style.display = "none";
}

// Close modal when clicking outside
comingSoonModal.addEventListener("click", (e) => {
  if (e.target === comingSoonModal) {
    closeModal();
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Escape to close modal
  if (e.key === "Escape") {
    closeModal();
  }

  // Number keys to filter
  if (e.key >= "1" && e.key <= "4") {
    const index = Number.parseInt(e.key) - 1;
    if (filterBtns[index]) {
      filterBtns[index].click();
    }
  }
});

// Add click handlers for coming soon tools
document.querySelectorAll(".tool-card.coming-soon").forEach((card) => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    showComingSoon();
  });
});
