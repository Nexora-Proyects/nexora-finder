// Clave secreta definida directamente
const SECRET_KEY = localStorage.getItem('secret_key');
// Token de autenticación almacenado en localStorage, utilizado para autenticar las peticiones
const token = localStorage.getItem("access_token");

// Notificaciones
function showNotification(title, body) {
  new Notification(title, {
    body,
    icon: '../../../../../assets/Logo.png' 
  });
}

// Función fetch con cabecera X-Tebex-Secret
function fetchWithSecret(url, options = {}) {
  if (!SECRET_KEY) {
    return Promise.reject("No se ha encontrado la secret_key");
  }

  const headers = {
    ...options.headers,
    "X-Tebex-Secret": SECRET_KEY,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  return fetch(url, {
    ...options,
    headers
  });
}

// Obtener información de la tienda
async function obtenerInformacionTienda() {
  try {
    const response = await fetchWithSecret('https://bc.minecloud.lol/api/v4/store-info');
    if (!response.ok) throw new Error('Error al obtener información de la tienda');
    const data = await response.json();

    document.getElementById('store-name').textContent = data.store_name || 'No disponible';
    const storeUrlEl = document.getElementById('store-url');
    storeUrlEl.href = data.store_url || '#';
    storeUrlEl.textContent = data.store_url || 'No disponible';
  } catch (error) {
    document.getElementById('store-name').textContent = 'Error al cargar';
    document.getElementById('store-url').textContent = 'Error al cargar';
  }
}

// Obtener cupones
async function obtenerCupones() {
  try {
    const response = await fetchWithSecret('https://bc.minecloud.lol/api/v4/coupons');
    if (!response.ok) throw new Error('Error en la respuesta');
    const result = await response.json();

    const container = document.getElementById('coupons-container');
    container.innerHTML = '';

    const coupons = result.data;

    if (Array.isArray(coupons) && coupons.length > 0) {
      coupons.forEach(coupon => {
        const item = document.createElement('div');
        item.classList.add('list-item');

        const info = document.createElement('div');
        info.classList.add('item-info');

        const h3 = document.createElement('h3');
        h3.textContent = coupon.code || 'Código no disponible';
        info.appendChild(h3);

        const pDesc = document.createElement('p');
        if (coupon.discount.type === 'percentage') {
          pDesc.textContent = `Descuento: ${coupon.discount.percentage}%`;
        } else if (coupon.discount.type === 'value') {
          pDesc.textContent = `Descuento: $${coupon.discount.value}`;
        } else {
          pDesc.textContent = 'Descuento: 0%';
        }
        info.appendChild(pDesc);

        const categories = coupon.effective.categories;
        const pCat = document.createElement('p');
        if (categories && categories.length > 0) {
          pCat.textContent = `Categorías: ${categories.join(', ')}`;
        } else {
          pCat.textContent = 'Categorías: General';
        }
        info.appendChild(pCat);

        item.appendChild(info);

        const btn = document.createElement('button');
        btn.classList.add('edit-btn');
        btn.innerHTML = '<i class="fas fa-edit"></i> Eliminar';

        btn.addEventListener('click', async () => {
          try {
            const deleteResponse = await fetchWithSecret(`https://bc.minecloud.lol/api/v4/coupons/${coupon.id}`, {
              method: 'DELETE'
            });
            if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json();
              showNotification('Error al eliminar cupón', errorData.error || deleteResponse.statusText);
              return;
            }
            showNotification('Cupón eliminado', 'Cupón eliminado exitosamente');
            obtenerCupones();
          } catch (error) {
            showNotification('Error al eliminar cupón', error.message);
          }
        });

        item.appendChild(btn);
        container.appendChild(item);
      });
    } else {
      container.innerHTML = '<span style="color: white;">No hay cupones disponibles.</span>';
    }
  } catch (error) {
    const container = document.getElementById('coupons-container');
    container.textContent = 'Error cargando cupones.';
  }
}

document.getElementById('searchForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const codeInput = document.getElementById('coupons-search');
  const code = codeInput.value.trim();

  if (!code) {
    showNotification('❌ Error', 'Debes ingresar un código');
    return;
  }

  try {
    const response = await fetchWithSecret('https://bc.minecloud.lol/api/v4/coupons', {
      method: 'POST',
      body: JSON.stringify({ code })
    });

    const result = await response.json();

    if (!response.ok) {
      showNotification('❌ Error', 'No se pudo crear el cupon');
      return;
    }

    showNotification('✅ Cupón creado', `Cupón "${code}" creado con 100% de descuento`);
    codeInput.value = '';
    obtenerCupones();
  } catch (error) {
    showNotification('⚠️ Api Off/Maintenaince', 'error');
  }
});

// Ejecutar funciones al cargar
obtenerInformacionTienda();
obtenerCupones();
