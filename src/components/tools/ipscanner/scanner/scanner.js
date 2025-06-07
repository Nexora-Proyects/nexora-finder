// Notificaciones
function showNotification(title, body) {
  new Notification(title, {
    body,
    icon: '../../../../../assets/Logo.png' 
  });
}

async function scanIP() {
  const token = localStorage.getItem("access_token");
  const ip_scan = localStorage.getItem("ip_scan");

  showNotification('⏳ Escaneando', 'Escaneando, por favor espera...');
  document.getElementById('results').innerHTML = '';

  try {
    const response = await fetch('https://ips.minecloud.lol/scan', {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
        "scan": ip_scan,
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();

    let html = `<p><strong>IP:</strong> ${data.ip}</p>`;
    html += `<p><strong>Es servidor Minecraft:</strong> ${data.is_minecraft ? 'Sí' : 'No'}</p>`;

    if (data.open_ports && data.open_ports.length > 0) {
      html += `<p><strong>Puertos abiertos:</strong> ${data.open_ports.join(', ')}</p>`;
    } else {
      html += `<p><strong>Puertos abiertos:</strong> Ninguno detectado</p>`;
    }

    if (data.is_minecraft) {
      const serverStatusUrl = `http://status.mclive.eu/Nexora/${encodeURIComponent(data.ip)}/25565/banner.png`;
      html += `<br>`;
      html += `<img src="${serverStatusUrl}" alt="Estado del servidor Minecraft" style="max-width: 100%; border-radius: 10px; margin-top: 10px;">`;
    }

    document.getElementById('results').innerHTML = html;
    showNotification('✅ IP-Scanner', 'Escaneo completado.');

  } catch (error) {
    showNotification('❌ IP-Scanner', `Error al escanear: ${error.message}`);
    document.getElementById('results').innerHTML = '';
  }
}

window.addEventListener('load', scanIP);
