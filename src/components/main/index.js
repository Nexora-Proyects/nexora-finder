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

// Función para cerrar sesión, limpiando los datos del almacenamiento local y redirigiendo a la página de login
function logout() {
  localStorage.clear(); // Elimina todos los elementos del localStorage
  window.location.href = '../auth/login.html'; // Redirige al usuario a la página de login
}
