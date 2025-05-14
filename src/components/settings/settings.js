// Notificaciones
function showNotification(title, body) {
  new Notification(title, {
    body,
    icon: '../../../assets/Logo.png' 
  });
}

document.querySelector('.confirm-button').addEventListener('click', async () => {
  const currentPassword = document.querySelectorAll('.pass-input')[0].value;
  const newPassword = document.querySelector('#ipInput').value;

  const username = localStorage.getItem('name');
  const token = localStorage.getItem('access_token'); 

  if (!username || !token) {
    alert('Token invalido');
    return;
  }

  try {
    const response = await fetch('https://auth.minecloud.lol/api/v1/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: username,
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      showNotification(`✅ ${data.message || 'Contraseña cambiada con exito'}`);
    } else {
      showNotification(`❌ ${data.message || 'Error al cambiar la contraseña'}`);
    }

  } catch (err) {
    showNotification(`⛔ Error de red: ${err.message}`);
  }
});

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