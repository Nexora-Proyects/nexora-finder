// Evento que se ejecuta cuando el DOM ha sido completamente cargado
document.addEventListener('DOMContentLoaded', function () {

  // Añade eventos a los botones con la clase '.header-btn' para redirigir al usuario a un enlace al hacer clic
  document.querySelectorAll('.header-btn').forEach(button => {
    button.addEventListener('click', () => {
      // Obtiene el valor del atributo 'data-link' que contiene la URL de destino
      const link = button.getAttribute('data-link');
      if (link) {
        // Redirige al usuario a la URL especificada en 'data-link'
        window.location.href = link;
      }
    });
  });

  // Añade interactividad a las tarjetas con la clase '.card'
  document.querySelectorAll('.card').forEach(card => {
    // Evento que se dispara al pasar el ratón sobre la tarjeta (mouseenter)
    card.addEventListener('mouseenter', function () {
      // Añade la clase 'hover' a la tarjeta para aplicar un efecto visual
      this.classList.add('hover');
    });
    
    // Evento que se dispara cuando el ratón sale de la tarjeta (mouseleave)
    card.addEventListener('mouseleave', function () {
      // Elimina la clase 'hover' de la tarjeta para quitar el efecto visual
      this.classList.remove('hover');
    });
  });

  const token = localStorage.getItem("access_token");

async function AccontRandom() {
  try {
    const res = await fetch('https://sc.minecloud.lol/api/v3/random', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const cuenta = data.purchases[0];

    // Mostrar cabeza de Minecraft
    const playerHead = document.getElementById('playerHead');
    playerHead.src = `https://eu.mc-api.net/v3/server/favicon/${cuenta.serverip}`;

    const resultServer = document.getElementById('resultServer')
    resultServer.src = `https://eu.mc-api.net/v3/server/favicon/${cuenta.serverip}`;

    // Mostrar datos
    document.getElementById('resultName').textContent = `${cuenta.name}`;
    document.getElementById('resultServer').textContent = `${cuenta.server}`;
    document.getElementById('resultPurchase').textContent = `${cuenta.purchase}`;
    document.getElementById('resultDate').textContent = `${cuenta.date}`;
    document.getElementById('resultServerIp').textContent = `${cuenta.serverip}`;

    // Mostrar contenedor
    document.getElementById('apiResult').style.display = 'block';
  } catch (error) {
    console.error('⚠️ Api Off/Maintenaince', error);
  }
}

// Ejecuta la función al cargar
window.onload = AccontRandom;

  // Evento para manejar la búsqueda cuando el formulario con id 'searchForm' se envía
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    // Evita que la página se recargue al enviar el formulario
    e.preventDefault();
    
    // Obtiene el valor del campo de entrada con id 'queryInput' y lo limpia de espacios adicionales
    const query = document.getElementById("queryInput").value.trim();
    if (query) {
      // Si hay un término de búsqueda, redirige a la página de búsqueda con el término como parámetro en la URL
      window.location.href = `user/search.html?nick=${encodeURIComponent(query)}`;
    }
  });
});
