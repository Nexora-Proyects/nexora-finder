// Configuration
const API_BASE_URL = "https://finder.minecloud.lol/api/v2/mc/";
const BOT_API_URL = "https://mf.minecloud.lol/bot/start";
const token = localStorage.getItem("access_token");

// DOM Elements
const searchForm = document.getElementById("searchForm");
const queryInput = document.getElementById("queryInput");
const databaseSelect = document.getElementById("databaseSelect");
const versionSelect = document.getElementById("versionSelect");
const resultsContainer = document.getElementById("resultsContainer");
const resultsCount = document.getElementById("resultsCount");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userStatus = document.getElementById("userStatus");
const recentSearches = document.getElementById("recentSearches");
const randomAccount = document.getElementById("randomAccount");
const initialState = document.getElementById("initialState");

// Database options
const databases = [
  { value: "Nexora_1", label: "nexora1.txt (5M)" },
  { value: "Nexora_2", label: "nexora2.txt (5M)" },
  { value: "Nexora_3", label: "nexora3.txt (5M)" },
  { value: "Nexora_4", label: "nexora4.txt (5M)" },
];

const versions = [
  { value: "1.20.4", label: "1.20.4" },
  { value: "1.19.4", label: "1.19.4" },
  { value: "1.18.2", label: "1.18.2" },
  { value: "1.17.1", label: "1.17.1" },
  { value: "1.16.5", label: "1.16.5" },
  { value: "1.12.2", label: "1.12.2" },
  { value: "1.8.9", label: "1.8.9" },
];

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupEventListeners();
  loadRandomAccount();
  setInterval(loadRandomAccount, 20000);
  loadRecentSearches();

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const nickFromUrl = urlParams.get("nick");
  if (nickFromUrl) {
    queryInput.value = nickFromUrl;
    performSearch(nickFromUrl);
  }

  // Añade eventos a los botones con la clase '.header-btn' para redirigir al usuario a un enlace al hacer clic
  document.querySelectorAll(".header-btn").forEach((button) => {
    button.addEventListener("click", () => {
      // Obtiene el valor del atributo 'data-link' que contiene la URL de destino
      const link = button.getAttribute("data-link");
      if (link) {
        // Redirige al usuario a la URL especificada en 'data-link'
        window.location.href = link;
      }
    });
  });

  // Añade interactividad a las tarjetas con la clase '.card'
  document.querySelectorAll(".card").forEach((card) => {
    // Evento que se dispara al pasar el ratón sobre la tarjeta (mouseenter)
    card.addEventListener("mouseenter", function () {
      // Añade la clase 'hover' a la tarjeta para aplicar un efecto visual
      this.classList.add("hover");
    });

    // Evento que se dispara cuando el ratón sale de la tarjeta (mouseleave)
    card.addEventListener("mouseleave", function () {
      // Elimina la clase 'hover' de la tarjeta para quitar el efecto visual
      this.classList.remove("hover");
    });
  });
});

// Initialize application
function initializeApp() {
  populateDatabaseSelector();
  populateVersionSelector();
  setupAnimations();
}

// Populate database selector
function populateDatabaseSelector() {
  databases.forEach((db) => {
    const option = document.createElement("option");
    option.value = db.value;
    option.textContent = db.label;
    databaseSelect.appendChild(option);
  });
}

// Populate version selector
function populateVersionSelector() {
  versions.forEach((version) => {
    const option = document.createElement("option");
    option.value = version.value;
    option.textContent = version.label;
    versionSelect.appendChild(option);
  });
  // Set default version
  versionSelect.value = "1.20.4";
}

// Setup event listeners
function setupEventListeners() {
  searchForm.addEventListener("submit", handleSearch);

  // Add input animation
  queryInput.addEventListener("focus", () => {
    queryInput.parentElement.style.transform = "scale(1.02)";
  });

  queryInput.addEventListener("blur", () => {
    queryInput.parentElement.style.transform = "scale(1)";
  });
}

// Handle search form submission
function handleSearch(event) {
  event.preventDefault();
  const query = queryInput.value.trim();

  if (query.length < 3) {
    showError("Por favor, introduce al menos 3 caracteres");
    return;
  }

  performSearch(query);
  addToRecentSearches(query);
}

// Perform search
async function performSearch(query) {
  showLoading();
  updateUserProfile(query);

  try {
    // Check if user is premium
    let isPremium = false;
    try {
      const mojangResponse = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(
          query
        )}`
      );
      isPremium = mojangResponse.status === 200;

      if (isPremium) {
        const mojangData = await mojangResponse.json();
        updateUserProfile(mojangData.name, true);
      }
    } catch (err) {
      console.log("Mojang API error:", err);
    }

    // Search in database
    const response = await fetch(API_BASE_URL + encodeURIComponent(query), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("No se encontraron resultados");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No se encontraron resultados");
    }

    displayResults(data, query);
    showNotification(
      "✅ Búsqueda exitosa",
      `Se encontraron ${data.length} resultados para: ${query}`
    );
  } catch (error) {
    showError(error.message);
    showNotification(
      "❌ Sin resultados",
      `No se encontraron datos para: ${query}`
    );
  }
}

// Display search results
function displayResults(results, query) {
  resultsContainer.innerHTML = "";
  resultsCount.textContent = `${results.length} resultados encontrados para "${query}"`;

  results.forEach((result, index) => {
    const card = createResultCard(result, index);
    resultsContainer.appendChild(card);
  });
}

// Create result card - MODIFICADO CON DEHASHER Y BOT BUTTON
function createResultCard(result, index) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.style.animationDelay = `${index * 0.1}s`;

  const serverIconUrl = `https://eu.mc-api.net/v3/server/favicon/${result.serverip}`;
  const fallbackIcon = "https://i.ibb.co/vKt7BCY/raw-Photoroom.png";
  const bannerUrl = `http://status.mclive.eu/Nexora/${result.serverip}/25565/banner.png`;
  const fallbackBanner = `http://status.mclive.eu/Nexora/nexora.net/25565/banner.png`;

  // Determine password display
  let passwordDisplay = "";
  let passwordClass = "";
  let dehashButton = "";

  if (result.password === "NULL" || result.password === "N/A") {
    passwordDisplay = "👺 No encontrada";
    passwordClass = "";
  } else if (result.password.length <= 16) {
    passwordDisplay = result.password;
    passwordClass = "plaintext";
  } else {
    passwordDisplay = result.password;
    passwordClass = "hash";
    dehashButton = `
      <button class="dehash-btn" onclick="dehashPassword('${result.name}', '${result.password}', this)">
        <i class="fas fa-unlock"></i> Dehashear
      </button>
    `;
  }

  card.innerHTML = `
    <div class="card-header">
      <img src="${serverIconUrl}" alt="Server Icon" class="server-icon" 
           onerror="this.src='${fallbackIcon}'">
      <div class="card-info">
        <h3>${result.name}</h3>
        <p>${result.serverip}</p>
      </div>
    </div>
    
    <div class="card-details">
      <div class="detail-row">
        <span class="detail-label">IP</span>
        <span class="detail-value">${
          result.ip === "NULL" ? "👺 No encontrada" : result.ip
        }</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Contraseña</span>
        <div class="password-container">
          <span class="detail-value ${passwordClass}" title="${passwordDisplay}">${passwordDisplay}</span>
          ${dehashButton}
        </div>
      </div>
    </div>

    <div class="banner-container">
      <img src="${bannerUrl}" alt="Server Banner" class="server-banner" 
           onerror="this.onerror=null; this.src='${fallbackBanner}'">
    </div>

        <div class="card-actions">
      <button class="bot-btn" onclick="startBot('${result.name}', '${
    result.serverip
  }', '${result.password}', this)">
        <i class="fas fa-play"></i> Iniciar AutoCheck
      </button>
    </div>
  `;

  return card;
}

async function dehashPassword(username, hash, buttonElement) {
  const wordlist = databaseSelect.value;

  if (!hash || !wordlist) {
    showNotification("⚠️ Error", "Datos insuficientes para dehashear");
    return;
  }

  // Mostrar estado de carga en el botón
  const originalContent = buttonElement.innerHTML;
  buttonElement.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Dehasheando...';
  buttonElement.disabled = true;

  showNotification("⏳ Dehasheando...", "En proceso, por favor espera...");

  const API_DEHASH_URL = `https://finder.minecloud.lol/api/v2/mc/dehash/${encodeURIComponent(
    username
  )}/${encodeURIComponent(wordlist)}/${encodeURIComponent(hash)}`;

  try {
    const response = await fetch(API_DEHASH_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      const passwordElement = buttonElement
        .closest(".password-container")
        .querySelector(".detail-value");
      passwordElement.textContent = result.password || result.message;
      passwordElement.className = "detail-value plaintext";
      passwordElement.title = result.password || result.message;

      buttonElement.remove();

      showNotification(
        "✅ Dehasheo Exitoso",
        result.message || "Hash descifrado correctamente"
      );
    } else {
      showNotification(
        "❌ Dehasheo Fallido",
        result.message || "No se pudo descifrar el hash"
      );

      // Restaurar botón
      buttonElement.innerHTML = originalContent;
      buttonElement.disabled = false;
    }
  } catch (error) {
    showNotification("⚠️ API Off/Maintenance", error.message);

    // Restaurar botón
    buttonElement.innerHTML = originalContent;
    buttonElement.disabled = false;
  }
}

// Start bot function
async function startBot(username, serverip, password, buttonElement) {
  const selectedVersion = versionSelect.value;

  if (!token) {
    showNotification("⚠️ Error", "Datos insuficientes para AutoCheck");
    return;
  }

  if (!selectedVersion) {
    showNotification("⚠️ Error", "Datos insuficientes para AutoCheck");
    return;
  }

  // Mostrar estado de carga en el botón
  const originalContent = buttonElement.innerHTML;
  buttonElement.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
  buttonElement.disabled = true;

  showNotification("🤖 Iniciando AutoCheck...", "Conectando al servidor...");

  try {
    const response = await fetch(BOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        host: serverip,
        port: "25565",
        version: selectedVersion,
        username: username,
        password: password === "NULL" || password === "N/A" ? "" : password,
      }),
    });

    if (response.status === 200) {
      const result = await response.json();
      showNotification(
        "✅ AutoCheck iniciado exitosamente",
        `Bot conectado a ${serverip} con ${username}`
      );

      buttonElement.classList.add("bot-active");

      // Cambiar el botón a estado de éxito
      buttonElement.innerHTML =
        '<i class="fas fa-check"></i> AutoCheck Exitoso';
      buttonElement.disabled = true;
    } else if (response.status === 401) {
      showNotification("❌ AutoCheck", "No se pudo unir al servidor");

      buttonElement.classList.add("bot-inactive");

      // Cambiar el botón a estado de Fallido
      buttonElement.innerHTML =
        '<i class="fas fa-xmark"></i> AutoCheck Fallido';
      buttonElement.disabled = true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      showNotification(
        "❌ AutoCheck",
        errorData.message || "Error al Iniciar AutoCheck"
      );

      buttonElement.classList.add("bot-inactive");

      // Cambiar el botón a estado de Fallido
      buttonElement.innerHTML =
        '<i class="fas fa-xmark"></i> AutoCheck Fallido';
      buttonElement.disabled = true;
    }
  } catch (error) {
    showNotification(
      "⚠️ Error de conexión",
      "No se pudo conectar con el servidor"
    );

    buttonElement.classList.add("bot-inactive");

    // Cambiar el botón a estado de Fallido
    buttonElement.innerHTML = '<i class="fas fa-check"></i> AutoCheck Fallido';
    buttonElement.innerHTML = originalContent;
    buttonElement.disabled = true;
  }
}

// Update user profile
function updateUserProfile(username, isPremium = false) {
  userName.textContent = username || "Usuario";
  userAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(
    username || "Steve"
  )}`;

  if (isPremium) {
    userStatus.innerHTML =
      '<i class="fas fa-crown"></i><span>Cuenta Premium</span>';
    userStatus.style.background = "rgba(34, 197, 94, 0.1)";
    userStatus.style.color = "var(--success-color)";
  } else {
    userStatus.innerHTML =
      '<i class="fas fa-user"></i><span>Cuenta Cracked</span>';
    userStatus.style.background = "rgba(220, 38, 38, 0.1)";
    userStatus.style.color = "var(--accent-red)";
  }
}

// Show loading state
function showLoading() {
  resultsContainer.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Buscando...</p>
    </div>
  `;
  resultsCount.textContent = "Buscando...";
}

// Show error state
function showError(message) {
  resultsContainer.innerHTML = `
    <div class="error-container">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <h3>Error en la búsqueda</h3>
      <p>${message}</p>
    </div>
  `;
  resultsCount.textContent = "Error en la búsqueda";
}

// Load random account
async function loadRandomAccount() {
  try {
    const response = await fetch("https://sc.minecloud.lol/api/v3/random", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const account = data.purchases[0];

    randomAccount.innerHTML = `
      <div class="card-header" style="margin-bottom: 1rem;">
        <img src="https://eu.mc-api.net/v3/server/favicon/${account.serverip}" 
             alt="Server Icon" class="server-icon" style="width: 32px; height: 32px;">
        <div class="card-info">
          <h4 style="font-size: 0.9rem; margin-bottom: 0.25rem;">${account.name}</h4>
          <p style="font-size: 0.75rem;">${account.server}</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-secondary);">
        <div style="margin-bottom: 0.5rem;">
          <strong>Compra:</strong> ${account.purchase}
        </div>
        <div>
          <strong>Fecha:</strong> ${account.date}
        </div>
      </div>
    `;
  } catch (error) {
    randomAccount.innerHTML =
      '<p style="color: var(--text-secondary); font-size: 0.875rem;">Error al cargar cuenta aleatoria</p>';
  }
}

// Recent searches management
function addToRecentSearches(query) {
  let searches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
  searches = searches.filter((s) => s !== query);
  searches.unshift(query);
  searches = searches.slice(0, 5);
  localStorage.setItem("recentSearches", JSON.stringify(searches));
  loadRecentSearches();
}

function loadRecentSearches() {
  const searches = JSON.parse(localStorage.getItem("recentSearches") || "[]");

  if (searches.length === 0) {
    recentSearches.innerHTML =
      '<p style="color: var(--text-secondary); font-size: 0.875rem;">No hay búsquedas recientes</p>';
    return;
  }

  recentSearches.innerHTML = searches
    .map(
      (search) => `
    <div class="stats-item" onclick="performSearch('${search}'); queryInput.value='${search}';">
      <span style="font-size: 0.875rem;">${search}</span>
      <i class="fas fa-arrow-right" style="color: var(--text-muted);"></i>
    </div>
  `
    )
    .join("");
}

// Setup animations
function setupAnimations() {
  // Add stagger animation to cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 100);
      }
    });
  });

  // Observe result cards
  document.addEventListener("DOMNodeInserted", (e) => {
    if (e.target.classList && e.target.classList.contains("result-card")) {
      e.target.style.opacity = "0";
      e.target.style.transform = "translateY(20px)";
      observer.observe(e.target);
    }
  });
}

// Notification system
function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "../../../assets/Logo.png",
    });
  }
}

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}
