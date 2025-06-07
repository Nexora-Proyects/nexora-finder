// Función para mostrar un mensaje en la pantalla con el tipo y la animación correspondiente
function showMessage(message, type) {
  const messageBox = document.getElementById("messageBox"); // Obtenemos el elemento donde se mostrará el mensaje
  messageBox.textContent = message; // Asignamos el mensaje de texto
  messageBox.className = `message ${type} fade-in`; // Establecemos la clase para el tipo de mensaje y la animación
  messageBox.style.display = "block"; // Mostramos el cuadro de mensaje
}

// Función asincrónica para manejar el inicio de sesión automático usando el refresh_token
async function autoLogin() {
  const refreshToken = localStorage.getItem("refresh_token"); // Recuperamos el refresh_token del almacenamiento local
  if (!refreshToken) return; // Si no hay refresh_token, no continuamos

  try {
    const response = await fetch("https://auth.minecloud.lol/api/v1/refresh-token", {
      method: "POST", // Enviamos una solicitud POST a la API
      headers: {
        "Authorization": `Bearer ${refreshToken}`, // Pasamos el refresh_token en la cabecera de autorización
        "Content-Type": "application/json" // Indicamos que el contenido es JSON
      }
    });

    if (response.ok) { // Si la respuesta es exitosa
      const data = await response.json(); // Obtenemos la respuesta como JSON
      localStorage.setItem("access_token", data.access_token); // Guardamos el nuevo access_token
      localStorage.setItem("refresh_token", data.refresh_token); // Guardamos el nuevo refresh_token

      showMessage("✅ Autologin exitoso.", "success"); // Mostramos un mensaje de éxito

      setTimeout(() => {
        document.body.classList.remove("show"); // Eliminamos la clase 'show'
        document.body.classList.add("fade"); // Añadimos la clase 'fade' para la transición
        setTimeout(() => {
          window.location.href = "../main/index.html"; // Redirigimos al usuario a la página principal
        }, 500); 
      }, 1500); // Esperamos 1.5 segundos antes de redirigir
    } else {
    }
  } catch (error) {
  }
}

// Al cargar el DOM, intentamos hacer el autologin y mostramos la animación de entrada
window.addEventListener("DOMContentLoaded", () => {
  autoLogin(); // Intentamos el autologin
  document.body.classList.add("fade", "show"); // Añadimos las clases para la animación de fade y show
});

// Evento para manejar el envío del formulario de inicio de sesión
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevenimos la acción por defecto del formulario

  const username = document.getElementById("username").value; // Obtenemos el valor del campo de nombre de usuario
  const password = document.getElementById("password").value; // Obtenemos el valor del campo de contraseña

  // Validación del nombre de usuario con expresión regular (alfanumérico de 1 a 24 caracteres)
  const usernameRegex = /^[a-zA-Z0-9_-]{1,24}$/;
  if (!usernameRegex.test(username)) {
    showMessage("❌ El usuario / contraseña son inválidos.", "error"); // Si el formato no es válido, mostramos un error
    return;
  }

  // Validación de la contraseña con expresión regular (alfanumérico de 1 a 24 caracteres)
  const passwordRegex = /^[a-zA-Z0-9_-]{1,24}$/;
  if (!passwordRegex.test(password)) {
    showMessage("❌ El usuario / contraseña son inválidos.", "error"); // Si el formato no es válido, mostramos un error
    return;
  }

  const loginData = { username, password }; // Creamos el objeto con los datos del usuario para el login

  try {
    const response = await fetch("https://auth.minecloud.lol/api/v1/login", {
      method: "POST", // Enviamos una solicitud POST a la API para realizar el login
      headers: {
        "Content-Type": "application/json" // Indicamos que el cuerpo de la solicitud es JSON
      },
      body: JSON.stringify(loginData) // Enviamos los datos del login como JSON
    });

    if (!response.ok) { // Si la respuesta no es exitosa
      const errorData = await response.json(); // Obtenemos los detalles del error
      showMessage(`❌ ${errorData.detail}`, "error"); // Mostramos el error
    } else { // Si el login es exitoso
      const data = await response.json(); // Obtenemos la respuesta con los tokens
      showMessage("✅ Login exitoso.", "success"); // Mostramos mensaje de éxito

      localStorage.setItem("access_token", data.access_token); // Guardamos el access_token
      localStorage.setItem("refresh_token", data.refresh_token); // Guardamos el refresh_token

      setTimeout(() => {
        document.body.classList.remove("show"); // Eliminamos la clase 'show'
        document.body.classList.add("fade"); // Añadimos la clase 'fade' para la transición
        setTimeout(() => {
          window.location.href = "../main/index.html"; // Redirigimos al usuario a la página principal
        }, 500); 
      }, 1500); // Esperamos 1.5 segundos antes de redirigir
    }
  } catch (error) {
    showMessage("⚠️ Api Off/Maintenaince", "error"); // Mostramos un mensaje de error si la API falla
  }
});
