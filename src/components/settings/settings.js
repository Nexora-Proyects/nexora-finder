// Notificaciones
function showNotification(title, body) {
  new Notification(title, {
    body,
    icon: '../../../assets/Logo.png' 
  });
}

const passwordRegex = /^[a-zA-Z0-9_-]{1,24}$/;

document.querySelector('.confirm-button').addEventListener('click', async () => {
  const currentPassword = document.querySelectorAll('.pass-input')[0].value;
  const newPassword = document.querySelector('#ipInput').value;

  const username = localStorage.getItem('name');
  const token = localStorage.getItem('access_token'); 

  if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
    showNotification("❌ La Contraseña  Actual/Nueva es invalida.");
    return;
  }

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
    showNotification('⚠️ Api Off/Maintenaince', err.message);
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