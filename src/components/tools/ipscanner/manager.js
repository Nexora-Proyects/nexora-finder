function showNotification(title, body) {
  new Notification(title, {
    body,
    icon: '../../../../assets/Logo.png'
  });
}

function isValidIP(ip) {
  const regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return regex.test(ip);
}

function handleIP(ip) {
  if (!ip || !isValidIP(ip)) {
    showNotification("⚠️ IP inválida", "Por favor ingresa una IP válida.");
    return;
  }
  localStorage.setItem("ip_scan", ip);
  window.location.href = "scanner/scanner.html"; 
}

document.getElementById("searchForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const input = document.getElementById("ip-search");
  const ip = input.value.trim();
  handleIP(ip);
});
