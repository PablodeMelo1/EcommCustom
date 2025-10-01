// src/App.js
import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Producto from './pages/Producto';
import Login from './pages/login';
import Admin from './pages/Admin';
import Usuario from './pages/Usuario';
import Carrito from './pages/Carrito';
import Busqueda from './pages/busqueda';
import Pedidos from './pages/admin/pedidos';
import PedidosCliente from './pages/pedidosCliente';
import Checkout from './pages/Checkout';
import CheckoutExito from './pages/CheckoutExito';
import Registro from './pages/registro';
import EsteticaAdmin from './pages/admin/estetica';
import PagosAdmin from './pages/admin/pagos';
import RedesAdmin from './pages/admin/redes';
import ProductosAdmin from './pages/admin/productos';

// Importamos el fetch centralizado
import { fetchWithRefresh } from './api';

// Crear contexto para compartir fetchWithRefresh
export const FetchContext = createContext();

function App() {
  const [config, setConfig] = useState(null);

  // Cargar configuración desde la API usando el fetch centralizado
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetchWithRefresh('/api/v1/config');
        if (!res.ok) throw new Error('Error cargando config');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error('Error al cargar config:', err);
      }
    };
    loadConfig();
  }, []);

  return (
    <FetchContext.Provider value={{ fetchWithRefresh }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home config={config} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/usuario" element={<Usuario />} />
          <Route path="/busqueda" element={<Busqueda />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkoutexito" element={<CheckoutExito />} />
          <Route path="/admin/pedidos" element={<Pedidos />} />
          <Route path="/admin/productos" element={<ProductosAdmin />} />
          <Route path="/admin/pagos" element={<PagosAdmin />} />
          <Route path="/admin/estetica" element={<EsteticaAdmin />} />
          <Route path="/admin/redes" element={<RedesAdmin />} />
          <Route path="/pedidosCliente" element={<PedidosCliente />} />
          <Route path="/producto/:id" element={<Producto config={config} />} /> 
          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Routes>
      </BrowserRouter>
    </FetchContext.Provider>
  );
}

export default App;
