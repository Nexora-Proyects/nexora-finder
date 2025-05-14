// Evento que se ejecuta cuando el DOM ha sido completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  // Obtiene el contenedor de partículas desde el DOM
  const particlesContainer = document.getElementById('particles-container');

  // Genera 100 partículas dentro del contenedor usando Array.from para crear una lista de 100 elementos
  Array.from({ length: 100 }).forEach(() => createParticle(particlesContainer));

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

// Función para crear una partícula dentro del contenedor especificado
function createParticle(container) {
  // Crea un nuevo div para representar la partícula
  const particle = document.createElement('div');
  particle.classList.add('particle');

  // Genera valores aleatorios para la posición (X y Y), tamaño, duración y retraso de la animación de la partícula
  const posX = Math.random() * 100;  // Posición aleatoria en el eje X (porcentaje)
  const posY = Math.random() * -100; // Posición aleatoria en el eje Y (porcentaje negativo para que inicie fuera de la vista)
  const size = Math.random() * 3 + 1; // Tamaño aleatorio entre 1 y 4 píxeles
  const duration = Math.random() * 30 + 10; // Duración aleatoria entre 10 y 40 segundos
  const delay = Math.random() * 5; // Retraso aleatorio antes de que comience la animación

  // Asigna las propiedades de estilo a la partícula generada (ubicación, tamaño y animación)
  particle.style.left = `${posX}%`;
  particle.style.top = `${posY}px`;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;

  // Añade la partícula al contenedor
  container.appendChild(particle);

  // Establece un temporizador para eliminar la partícula después de que su animación haya terminado y crear una nueva partícula
  setTimeout(() => {
    particle.remove(); // Elimina la partícula del DOM
    createParticle(container); // Crea una nueva partícula dentro del contenedor
  }, (duration + delay) * 1000); // El temporizador depende de la duración y el retraso de la animación

}
