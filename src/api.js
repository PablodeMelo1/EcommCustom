// src/api.js
export const BASE_URL = 'http://localhost:3001';

// fetch principal con refresh automático (versión corregida y simplificada)
export const fetchWithRefresh = async (endpoint, options = {}) => {
  let token = localStorage.getItem('token');

  const makeRequest = (tok) =>
    fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: tok ? `Bearer ${tok}` : undefined,
      },
      credentials: 'include', // manda cookies (refreshToken)
    });

  const resOriginal = await makeRequest(token);

  // Solo reaccionamos al 401 (No Autorizado), que indica un token de acceso expirado
  if (resOriginal.status === 401) {
    console.log("Token expirado. Intentando refrescar...");
    
    const refreshRes = await fetch(`${BASE_URL}/api/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        // Reintentamos la petición original con el nuevo token
        return makeRequest(accessToken);
      }
    } else {
      // Si el refresh falla (ej: cookie inválida o expirada), limpiamos el token.
      console.error("Falló el refresh token. Deslogueando...");
      localStorage.removeItem('token');
      //Opcional: Redirigir al usuario a la página de login
      window.location.href = '/login'; 
      return refreshRes; // Devolvemos la respuesta del refresh fallido para que el error sea manejado
    }
  }

  return resOriginal; // Devolvemos la respuesta original si no hubo error 401
};

// ---------- HELPERS ----------
// (El resto de tus funciones que ya usan fetchWithRefresh)

// Login
export const login = async ({ mail, contra }) => {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail, contra }),
    credentials: 'include',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error en login');
  }

  return await res.json(); // devuelve { accessToken, usuario }
};

// Traer carrito del usuario
export const getCarrito = async (userId) => {
  console.log(userId)//esto me llega undefined
  const res = await fetchWithRefresh(`/api/carrito/${userId}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al obtener carrito');
  }

  return await res.json();
};

// Guardar carrito del usuario
export const saveCarrito = async (userId, items) => {
  const res = await fetchWithRefresh(`/api/carrito/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al guardar carrito');
  }

  return await res.json();
};

// Pedidos del cliente
export const fetchPedidosCliente = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No autenticado');

  const res = await fetchWithRefresh('/api/pedidos/cliente', {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    // Si el error persiste después del refresh, lo lanzamos.
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al cargar pedidos');
  }

  return await res.json();
};