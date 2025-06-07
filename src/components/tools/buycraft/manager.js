// Token de autenticación almacenado en localStorage, utilizado para autenticar las peticiones
const token = localStorage.getItem("access_token");

// Notificaciones
function showNotification(title, body) {
  new Notification(title, {
    body,
    icon: '../../../../assets/Logo.png' 
  });
}
document.getElementById("searchForm").addEventListener("submit", async function(e) {
  e.preventDefault(); 

  const input = document.getElementById("coupons-search");
  const secretKey = input.value.trim();

  if (!secretKey) return;

  try {
    const response = await fetch("https://bc.minecloud.lol/api/v4/store-info", {
      headers: {
        "X-Tebex-Secret": secretKey,
        "Authorization": `Bearer ${token}`,
      }
    });

    if (response.ok) {
      const data = await response.json();

      localStorage.setItem("secret_key", secretKey);

      showNotification("✅ Secret Key válida", "La Secret Key Es correcta");
      input.value = "";
      window.location.href = "buycraft/buycraft.html";
    } else {
      showNotification("❌ Secret Key inválida", "Verifica tu Secret Key e intenta nuevamente.");
    }
  } catch (error) {
    console.error("Error al verificar la clave:", error);
    showNotification("⚠️ Api Off/Maintenaince", "error");
  }
});
