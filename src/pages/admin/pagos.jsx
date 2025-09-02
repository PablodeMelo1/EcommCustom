import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../../api'; // tu fetch centralizado

const CONFIG_URL = '/api/config'; // URL centralizada

export default function Pagos() {
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [form, setForm] = useState({
    mercadoPagoCheck: false,
    transferenciaCheck: false,
    efectivoCheck: false,
    accessTokenMP: '',
    efectivoTexto: '',
    transferenciaCuentas: [],
  });

  const [nuevaCuenta, setNuevaCuenta] = useState({
    nombre: '',
    banco: '',
    numeroCuenta: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }

    async function loadConfig() {
      try {
        const res = await fetchWithRefresh(CONFIG_URL);
        if (!res.ok) throw new Error('Error al cargar la configuración');
        const data = await res.json();
        setConfig(data);
        setForm(data);
      } catch (err) {
        console.error('Error al cargar config:', err);
        setMessage('Error al cargar configuración ❌');
        setMessageType('error');
      }
    }

    loadConfig();
  }, [navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleNuevaCuentaChange(e) {
    setNuevaCuenta({ ...nuevaCuenta, [e.target.name]: e.target.value });
  }

  function agregarCuenta() {
    if (!nuevaCuenta.nombre || !nuevaCuenta.banco || !nuevaCuenta.numeroCuenta) return;
    setForm({
      ...form,
      transferenciaCuentas: [...form.transferenciaCuentas, nuevaCuenta]
    });
    setNuevaCuenta({ nombre: '', banco: '', numeroCuenta: '' });
  }

  function eliminarCuenta(index) {
    setForm({
      ...form,
      transferenciaCuentas: form.transferenciaCuentas.filter((_, i) => i !== index)
    });
  }

  // En tu componente Pagos.jsx
  // ... (código existente, no se necesita cambiar nada más) ...

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            // --- Cambiamos de JSON a FormData ---
            const formData = new FormData();

            // Iteramos sobre todos los campos del formulario
            for (const key in form) {
                const value = form[key];

                // Los arrays y objetos deben ser convertidos a JSON string
                if (typeof value === 'object' && value !== null) {
                    // `JSON.stringify` convierte el array de cuentas en una cadena
                    formData.append(key, JSON.stringify(value));
                } else {
                    // Los valores simples (strings, booleans, numbers) se agregan directamente
                    formData.append(key, value);
                }
            }
            
            // No necesitamos el `headers: { 'Content-Type': 'application/json' }`
            // `FormData` se encarga de establecer el `Content-Type` automáticamente
            const res = await fetchWithRefresh(CONFIG_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error al guardar');

            setConfig(data);
            setForm(data.config); // Tu backend debe devolver el objeto de configuración en `data.config`
            setMessage(data.message || 'Cambios guardados correctamente ✅');
            setMessageType('success');
        } catch (error) {
            setMessage(error.message || 'Error al guardar los cambios ❌');
            setMessageType('error');
        }
    }

  if (!config) return <p className="cargando">Cargando configuración...</p>;

  return (
    <div className="config-container">
      <h1>¡Bienvenido Administrador!</h1>
      <h2>Panel de configuración</h2>

      <form onSubmit={handleSubmit}>
        <h3>Métodos de Pago</h3>

        {/* Mercado Pago */}
        <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>Mercado Pago</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="mercadoPagoCheck"
                checked={form.mercadoPagoCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            Token Mercado Pago:
            <input type="password" name="accessTokenMP" value={form.accessTokenMP} onChange={handleChange} />
          </label>
        </div>

        {/* Transferencia Bancaria */}
        <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>Transferencia Bancaria</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="transferenciaCheck"
                checked={form.transferenciaCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {form.transferenciaCheck && (
          <div>
            <h4>Cuentas Bancarias</h4>
            <table className="tablaCuentas">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Banco</th>
                  <th>Número de cuenta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {form.transferenciaCuentas.map((cuenta, index) => (
                  <tr key={index}>
                    <td>{cuenta.nombre}</td>
                    <td>{cuenta.banco}</td>
                    <td>{cuenta.numeroCuenta}</td>
                    <td>
                      <button type="button" onClick={() => eliminarCuenta(index)}>❌</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="nuevaCuenta">
              <input
                type="text"
                placeholder="Nombre de la cuenta"
                name="nombre"
                value={nuevaCuenta.nombre}
                onChange={handleNuevaCuentaChange}
              />
              <input
                type="text"
                placeholder="Banco"
                name="banco"
                value={nuevaCuenta.banco}
                onChange={handleNuevaCuentaChange}
              />
              <input
                type="text"
                placeholder="Número de cuenta"
                name="numeroCuenta"
                value={nuevaCuenta.numeroCuenta}
                onChange={handleNuevaCuentaChange}
              />
              <button type="button" onClick={agregarCuenta}>➕</button>
            </div>
          </div>
        )}

        {/* Pago en efectivo */}
        <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>Pago en efectivo</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="efectivoCheck"
                checked={form.efectivoCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            Ubicación:
            <input type="text" name="efectivoTexto" value={form.efectivoTexto} onChange={handleChange} />
          </label>
        </div>

        <button type="submit">Guardar cambios</button>
      </form>

      {message && (
        <p style={{ color: messageType === 'success' ? 'green' : 'red', textAlign: 'center' }}>
          {message}
        </p>
      )}

      <div className="volver">
        <a href="/admin">&larr; Volver al inicio</a>
      </div>
    </div>
  );
}
