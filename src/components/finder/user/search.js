// URL base de la API que se utilizará para obtener los datos
const API_BASE_URL = "https://finder.minecloud.lol/api/v2/mc/";
const API_FLAYER_URL = "https://mf.minecloud.lol/bot/start";

// Token de autenticación almacenado en localStorage, utilizado para autenticar las peticiones
const token = localStorage.getItem("access_token");

// Elementos del DOM donde se mostrarán los resultados y donde se seleccionará la base de datos
const resultsDiv = document.getElementById("results");
const databaseSelect = document.getElementById("databaseSelect");

let selectedUsername = null;

// Notificaciones
function showNotification(title, body) {
  new Notification(title, {
    body,
    icon: '../../../../assets/Logo.png' 
  });
}

// Lista de bases de datos disponibles para la búsqueda
const databases = [
  { value: "Nexora_1", label: "nexora1.txt (20M)" },
  { value: "Nexora_2", label: "nexora2.txt (20M)" },
];

// Función para crear partículas animadas en la pantalla para un efecto visual dinámico
const createParticle = () => {
  const p = document.createElement("div");
  p.className = "particle";

  // Propiedades aleatorias para las partículas
  const posX = Math.random() * 100;
  const posY = Math.random() * -100;
  const size = Math.random() * 3 + 1;
  const duration = Math.random() * 30 + 10;
  const delay = Math.random() * 5;

  // Asignación de estilo a la partícula
  Object.assign(p.style, {
    left: `${posX}%`,
    top: `${posY}px`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  });

  // Añadir la partícula al contenedor de partículas
  document.getElementById("particles-container").appendChild(p);

  // Eliminar la partícula después de que termine la animación y crear una nueva
  setTimeout(() => {
    p.remove();
    createParticle();
  }, (duration + delay) * 1000);
};

// Función para mostrar un mensaje de error en la interfaz
const showError = (message) => {
  resultsDiv.innerHTML = `
    <div class="error-card">
      <div class="error-icon">!</div>
      <div class="error-message">${message}</div>
    </div>`;
};

// Función para crear una tarjeta con los resultados obtenidos
const createResultCard = ({ name, ip, password, serverip }) => {
  const card = document.createElement("div");
  card.className = "result-card";

  // URL para obtener el estado del servidor (banner)
  const serverStatus = `http://status.mclive.eu/Nexora/${encodeURIComponent(serverip)}/25565/banner.png`;

  // Estructura de la tarjeta con los detalles del jugador y servidor
  card.innerHTML = `
    <div class="result-header">
      <img src="https://eu.mc-api.net/v3/server/favicon/${serverip}" alt="Server Icon" class="result-avatar" onerror="this.onerror=null; this.src='https://i.ibb.co/vKt7BCY/raw-Photoroom.png';"/>
      <div class="result-info">
        <div class="result-title">${name}</div>
        <div class="result-server">${serverip}</div>
      </div>
    </div>
    <div class="result-content">
      <div class="detail-row">
        <span class="detail-label">IP:</span>
        <span class="detail-value">${ip === 'NULL' || ip === 'null' ? '👺 No se encontró la IP' : ip}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Contraseña:</span>
        <span class="detail-value ${password && password.length > 16 ? 'hash' : ''}">${password === 'NULL' || password === 'N/A' ? '👺 No se encontró la password' : password}</span>
      </div>
      <div class="server-status">
        <img src="${serverStatus}" alt="Server Status" onerror="this.onerror=null; this.src='http://status.mclive.eu/Nexora/nexora.net/25565/banner.png';" />
      </div>
    </div>`;

  return card;
};

// Función para actualizar el pie de página con la información del jugador y su estado premium
const updateFooter = (name, isPremium) => {
  const footer = document.getElementById("footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="result-header">
      <img src="https://mc-heads.net/avatar/${encodeURIComponent(name || "Steve")}" alt="Avatar" class="result-avatar" />
      <div class="result-info">
        <div class="result-title">${name || "NULL"}</div>
        <div class="result-server">${isPremium ? "✅ Premium" : "❌ No Premium"}</div>
      </div>
    </div>`;
};

// Función principal para obtener los resultados de la búsqueda de un jugador
const fetchResults = async (nick) => {
  selectedUsername = nick;
  // Actualización del pie de página con un "cargando"
  const footer = document.getElementById("footer");
  resultsDiv.innerHTML = `
    <div class="loading">
      <div class="loader"></div>
    </div>`;

  let isPremium = false;

  try {
    // Verificar si el jugador es premium consultando la API de Mojang
    const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(nick)}`);
    isPremium = mojangResponse.status === 200;

    if (isPremium) {
      const mojangData = await mojangResponse.json();
      updateFooter(mojangData.name, true);
    } else {
      updateFooter(nick, false);
    }
  } catch (err) {
    updateFooter(nick, false);
  }

  try {
    // Realizar la solicitud a la API personalizada para obtener los detalles del jugador
    const response = await fetch(API_BASE_URL + encodeURIComponent(nick), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si no hay resultados o la respuesta no es válida, mostrar un error
    if (!response.ok) {
      showError("No se encontraron resultados.");
      return;
    }

    const data = await response.json();
    resultsDiv.innerHTML = "";

    // Si los datos no son un array o están vacíos, mostrar error
    if (!Array.isArray(data) || data.length === 0) {
      showError("No se encontraron resultados.");
      return;
    }

    // Mostrar los resultados en el DOM
    data.forEach((entry) => {
      resultsDiv.appendChild(createResultCard(entry));
    });

  } catch (err) {
    showError("Error al cargar resultados.");
  }
};

// Función para realizar la búsqueda de un nick
const performSearch = () => {
  const nick = document.getElementById("searchInput").value.trim();

  // Validar que el nick tenga al menos 3 caracteres
  if (nick.length < 3) {
    showError("Por favor, introduzca al menos 3 caracteres");
    return;
  }

  // Actualizar la URL para reflejar el nick buscado
  const newUrl = `${window.location.pathname}?nick=${encodeURIComponent(nick)}`;
  history.replaceState(null, "", newUrl);

  // Llamar a la función para obtener los resultados
  fetchResults(nick);
};

// Función para llenar el selector de base de datos con las opciones
const populateDatabaseSelector = () => {
  databases.forEach((db) => {
    const option = document.createElement("option");
    option.value = db.value;
    option.textContent = db.label;
    databaseSelect.appendChild(option);
  });
};

  // Función para abrir el autocheck
  function CheckopenModal() {
    document.getElementById('dehash-modal').classList.remove('show');
    document.getElementById('check-modal').classList.add('show');
    document.getElementById('overlay').style.display = 'block'; 
    document.body.style.overflow = 'hidden';
  }

  // Función para cerrar el autocheck
  function CheckcloseModal() {
    document.getElementById('check-modal').classList.remove('show');
    document.getElementById('overlay').style.display = 'none'; 
    document.body.style.overflow = 'auto'; 
  }

document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const host = document.getElementById('host').value;
  const port = parseInt(document.getElementById('port').value) || 25565;
  const username = document.getElementById('name').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(API_FLAYER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ host, port, username, password })
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('✅ Verificación exitosa', result.message);
    } else {
      showNotification('❌ Verificación Fallida', result.message);
    }

  } catch (error) {
    showNotification('⚠️ Api Off/Maintenaince', error.message);
  }
});

  // Función para abrir el dehash
  function DehashopenModal() {
    document.getElementById('check-modal').classList.remove('show');
    document.getElementById('dehash-modal').classList.add('show');
    document.getElementById('overlay').style.display = 'block'; 
    document.body.style.overflow = 'hidden';
  }

  // Función para cerrar el dehash
  function DehashcloseModal() {
    document.getElementById('dehash-modal').classList.remove('show');
    document.getElementById('overlay').style.display = 'none'; 
    document.body.style.overflow = 'auto'; 
  }

// Manejar el formulario de dehash
document.getElementById('form-dehash').addEventListener('submit', async function (e) {
  e.preventDefault();

  const hash = document.getElementById('hash').value.trim();
  const wordlist = document.getElementById('databaseSelect').value;

  if (!selectedUsername || !hash || !wordlist) {
    showNotification('⚠️ Campos incompletos', 'Debes introducir un Hash');
    return;
  }

  const API_DEHASH_URL = `https://finder.minecloud.lol/api/v2/mc/dehash/${encodeURIComponent(selectedUsername)}/${encodeURIComponent(wordlist)}/${encodeURIComponent(hash)}`;

  try {
    const response = await fetch(API_DEHASH_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('✅ Dehasheo Exitoso', result.message || 'Hash descifrado correctamente');
    } else {
      showNotification('❌ Dehasheo Fallido', result.message || 'No se pudo descifrar el hash');
    }

  } catch (error) {
    showNotification('⚠️ Api Off/Maintenaince', error.message);
  }
});

// Evento que se ejecuta cuando la página está completamente cargada
document.addEventListener("DOMContentLoaded", () => {
  // Llenar el selector de base de datos
  populateDatabaseSelector();

  // Manejar el envío del formulario de búsqueda
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performSearch();
  });

  // Crear 50 partículas al cargar la página
  for (let i = 0; i < 50; i++) createParticle();

  // Si hay un nick en la URL, realizar la búsqueda automáticamente
  const nickFromUrl = new URLSearchParams(window.location.search).get("nick");
  if (nickFromUrl) {
    document.getElementById("searchInput").value = nickFromUrl;
    fetchResults(nickFromUrl);
  }
});
