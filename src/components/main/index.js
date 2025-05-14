// Obtener el token de acceso almacenado en el localStorage
const token = localStorage.getItem("access_token");

// Verificar si existe el token
if (token) {
  // Si el token existe, realizar una solicitud GET al endpoint para actualizar la hora
  fetch("https://auth.minecloud.lol/api/v1/update-time", {
    headers: {
      // Incluir el token en la cabecera Authorization usando el esquema Bearer
      "Authorization": "Bearer " + token
    }
  })
  // Convertir la respuesta a formato JSON
  .then(res => res.json())
  // Manipular los datos recibidos del servidor
  .then(data => {
    // Mostrar el nombre del usuario en el elemento con id "name" Tambien Guardamos el name
    document.getElementById("name").textContent = data.name;
    localStorage.setItem("name", data.name);
    // Mostrar el rol del usuario en el elemento con id "role" Tambien Guardamos el role
    document.getElementById("role").textContent = data.role;
    localStorage.setItem("role", data.role);
    // Mostrar la hora actualizada en el elemento con id "time" Tambien Guardamos el time
    document.getElementById("time").textContent = data.time;
    localStorage.setItem("time", data.time);
  })
  // Capturar cualquier error que ocurra durante la solicitud
  .catch(() => {
    // Mostrar un mensaje de error en el elemento con id "userInfo"
    document.getElementById("user-Info").textContent = "Error al Actualizar";
  });

} else {
  // Si no hay token, mostrar mensaje de token inválido en el elemento con id "userInfo"
  document.getElementById("user-Info").textContent = "Token invalido";
}

// Evento que se ejecuta cuando el DOM ha sido completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Obtiene el contenedor de partículas del DOM
  const particlesContainer = document.getElementById('particles-container');

  // Genera 100 partículas dentro del contenedor
  for (let i = 0; i < 100; i++) {
    createParticle(particlesContainer);
  }

  // Obtiene todas las tarjetas del DOM con la clase 'card'
  const cards = document.querySelectorAll('.card');
  
  // Añade un evento de 'mouseenter' a cada tarjeta para agregar la clase 'hover' al pasar el ratón sobre ellas
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });

    // Añade un evento de 'mouseleave' a cada tarjeta para eliminar la clase 'hover' cuando el ratón salga de la tarjeta
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
});

// Función para crear una partícula dentro del contenedor proporcionado
function createParticle(container) {
  // Crea un nuevo elemento div para representar la partícula
  const particle = document.createElement('div');
  particle.classList.add('particle');

  // Genera valores aleatorios para la posición, tamaño, duración y retraso de la animación de la partícula
  const posX = Math.random() * 100; // Posición aleatoria en el eje X (porcentaje)
  const posY = Math.random() * -100; // Posición aleatoria en el eje Y (porcentaje negativo para que inicie fuera de la vista)
  const size = Math.random() * 3 + 1; // Tamaño aleatorio entre 1 y 4 píxeles
  const duration = Math.random() * 30 + 10; // Duración aleatoria entre 10 y 40 segundos
  const delay = Math.random() * 5; // Retraso aleatorio antes de que la animación comience

  // Asigna las propiedades de estilo a la partícula generada
  particle.style.left = `${posX}%`;
  particle.style.top = `${posY}px`;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;

  // Añade la partícula al contenedor
  container.appendChild(particle);

  // Establece un temporizador para eliminar la partícula después de que su animación haya terminado,
  // y luego crea una nueva partícula
  setTimeout(() => {
    particle.remove(); // Elimina la partícula actual del DOM
    createParticle(container); // Crea una nueva partícula dentro del contenedor
  }, (duration + delay) * 1000); // El temporizador depende de la duración y el retraso de la animación
}

// Función para cerrar sesión, limpiando los datos del almacenamiento local y redirigiendo a la página de login
function logout() {
  localStorage.clear(); // Elimina todos los elementos del localStorage
  window.location.href = '../auth/login.html'; // Redirige al usuario a la página de login
}
