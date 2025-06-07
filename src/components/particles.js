const container = document.getElementById('particles-container');

function random(min, max) {
  return Math.random() * (max - min) + min;
}

for (let i = 0; i < 100; i++) {
  const particle = document.createElement('div');
  particle.className = 'particle';

  // Distribuir partículas en toda la pantalla
  particle.style.left = `${random(0, 100)}vw`;
  particle.style.top = `${random(0, 100)}vh`;

  // Tamaño aleatorio
  particle.style.width = particle.style.height = `${random(2, 6)}px`;

  // Dirección aleatoria de explosión
  particle.style.setProperty("--x", `${random(-10, 10)}vw`);
  particle.style.setProperty("--y", `${random(-10, 10)}vh`);

  // Duración variable para una dispersión más natural
  particle.style.animationDuration = `${random(6, 12)}s`;

  container.appendChild(particle);
}
