import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [form, setForm] = useState({
    logoUrl: '',
    colorNav: '',
    colorPrincipal: '',
    fuentePrincipal: '',
    nombreTienda: '',
    bannerTexto: '',
    tipoCatalogo: '',
    
    mercadoPagoCheck: false,
    transferenciaCheck: false,
    efectivoCheck: false,

    accessTokenMP: '',
    efectivoTexto: '',
    transferenciaCuentas: [],

    igCheck: false,
    xCheck: false,
    fbCheck: false,
    ttCheck: false,
    wpCheck: false,
    emailCheck: false,

    igTexto: '',
    xTexto: '',
    fbTexto: '',
    ttTexto: '',
    wpTexto: '',
    emailTexto: ''
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
    }
    fetch('http://localhost:3001/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setForm(data);
      });
  }, []);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const res = await fetch('http://localhost:3001/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      setConfig(data);
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
        <label>
          Logo URL:
          <input type="text" name="logoUrl" value={form.logoUrl} onChange={handleChange} />
        </label>

        <label>
          Color barra de navegación:
          <input type="color" name="colorNav" value={form.colorNav} onChange={handleChange} />
        </label>

        <label>
          Color principal:
          <input type="color" name="colorPrincipal" value={form.colorPrincipal} onChange={handleChange} />
        </label>

        <label>
          Color de fuente:
          <select name="fuentePrincipal" value={form.fuentePrincipal} onChange={handleChange}>
            <option value="#000">Negro</option>
            <option value="#fff">Blanco</option>
          </select>
        </label>

        <label>
          Nombre tienda:
          <input type="text" name="nombreTienda" value={form.nombreTienda} onChange={handleChange} />
        </label>

        <label>
          Texto banner:
          <input type="text" name="bannerTexto" value={form.bannerTexto} onChange={handleChange} />
        </label>

        <label>
          Tipo catálogo:
          <select name="tipoCatalogo" value={form.tipoCatalogo} onChange={handleChange}>
            <option value="grid">Cuadricula</option>
            <option value="list">Lista</option>
          </select>
        </label>
        <h3>Metodos de Pago</h3>
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


        {/* REDES SOCIALES */}
        <h3>Redes sociales</h3>
        <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>Instagram</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="igCheck"
                checked={form.igCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            Link:
            <input type="text" name="igTexto" value={form.igTexto} onChange={handleChange} />
          </label>
        </div>
        <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>X:</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="xCheck"
                checked={form.xCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            Link:
            <input type="text" name="xTexto" value={form.xTexto} onChange={handleChange} />
          </label>
        </div>

        <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>Facebook</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="fbCheck"
                checked={form.fbCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            link:
            <input type="text" name="fbTexto" value={form.fbTexto} onChange={handleChange} />
          </label>
          </div>

          <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>TikTok</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="ttCheck"
                checked={form.ttCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            link:
            <input type="text" name="ttTexto" value={form.ttTexto} onChange={handleChange} />
          </label>
          </div>

           <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>Whatsapp</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="wpCheck"
                checked={form.wpCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            Numero de Whatsapp:
            <input type="number" name="wpTexto" placeholder='59899487555' value={form.wpTexto} onChange={handleChange} />
          </label>
          </div>

           <div className="metodosPago">
          <div className="metodoTitulo">
            <h3>Email</h3>
            <label className="switch">
              <input
                type="checkbox"
                name="emailCheck"
                checked={form.emailCheck}
                onChange={(e) =>
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
          <label className="campoMetodo">
            link:
            <input type="email" name="emailTexto" placeholder='example@example.com' value={form.emailTexto} onChange={handleChange} />
          </label>
          </div>

        
        <button type="submit">Guardar cambios</button>
      </form>
      

      {message && (
        <p style={{
          color: messageType === 'success' ? 'green' : 'red',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}

      <div className="volver">
        <a href="/">&larr; Volver al inicio</a>
      </div>
      <div className="volver">
        <a href="/admin/productos">Gestionar Productos &rarr;</a><br />
      </div>
      <div className="volver">
        <a href="/admin/pedidos">Gestionar Pedidos &rarr;</a>
      </div>
    </div>
  );
}
