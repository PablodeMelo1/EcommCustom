import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../api';
import '../styles/Carrito.css';
import Nav from '../Components/Nav';

export default function Checkout() {
  const [carrito, setCarrito] = useState([]);
  const [totalBase, setTotalBase] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('envio');
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formulario, setFormulario] = useState({
    direccion: '',
    numeroCasa: '',
    tipoCasa: '',
    ciudad: '',
    departamento: '',
    pais: 'Uruguay',
    infoAdicional: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(data);
    setTotalBase(data.reduce((acc, item) => acc + item.price * item.quantity, 0));

    // Cargar config desde API usando fetchWithRefresh
    const cargarConfig = async () => {
      try {
        const res = await fetchWithRefresh('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar configuración');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarConfig();
  }, [token]);

  useEffect(() => {
    const envioExtra = tipoEntrega === 'envio' ? 200 : 0;
    setTotal((totalBase + envioExtra).toFixed(2));
  }, [tipoEntrega, totalBase]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };
  const handlePaymentMethodChange = e => setPaymentMethod(e.target.value);
  const handleTipoEntregaChange = e => setTipoEntrega(e.target.value);

  const handleConfirmarCompra = async e => {
    e.preventDefault();
    if (!token) return navigate('/login');
    if (carrito.length === 0) return setMessage('El carrito está vacío'), setMessageType('error');
    if (!paymentMethod) return setMessage('Seleccioná un método de pago'), setMessageType('error');

    const pedidoData = { items: carrito, total, paymentMethod, tipoEntrega, ...(tipoEntrega === 'envio' ? formulario : {}) };

    try {
      if (paymentMethod === 'mercado_pago') {
        localStorage.removeItem('carrito');
        const res = await fetchWithRefresh('/api/crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(pedidoData)
        });
        const data = await res.json();
        if (data.init_point) return window.location.href = data.init_point;
        throw new Error('No se pudo generar el link de pago');
      } else {
        const res = await fetchWithRefresh('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(pedidoData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear el pedido');

        localStorage.removeItem('carrito');
        navigate(`/CheckoutExito?pedidoId=${data.pedido._id}`);
      }
    } catch (err) {
      setMessage(err.message || 'Error inesperado');
      setMessageType('error');
      console.error(err);
    }
  };

  if (!config) return (
    <>
      <Nav />
      <div className="carrito-container" style={{ maxWidth: '600px' }}>
        <h2>Confirmar Compra</h2>
        <p>Cargando configuración...</p>
      </div>
    </>
  );

  if (carrito.length === 0) return (
    <>
      <Nav />
      <div className="carrito-container" style={{ maxWidth: '600px' }}>
        <h2>Confirmar Compra</h2>
        <p className="carrito-empty">Tu carrito está vacío</p>
      </div>
    </>
  );

  return (
    <>
      <Nav />
      <div className="carrito-container" style={{ maxWidth: '1000px' }}>
        <h2>Confirmar Compra</h2>
        <ul className="checkout-list">
          {carrito.map(item => (
            <li key={item.productId} className="checkout-item">
              {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <h3 className="carrito-total">Total: ${total}</h3>

        <form className="checkout-form" onSubmit={handleConfirmarCompra}>
          <h3>Tipo de Entrega</h3>
          {['envio', 'retiro'].map(opt => (
            <label key={opt}>
              <input type="radio" name="tipoEntrega" value={opt} checked={tipoEntrega === opt} onChange={handleTipoEntregaChange} />
              {opt === 'envio' ? 'Envío a domicilio (+ $200)' : 'Retiro en persona'}
            </label>
          ))}

          {tipoEntrega === 'envio' && Object.entries(formulario).map(([key, value]) =>
            key !== 'infoAdicional' ? (
              <input key={key} type="text" name={key} placeholder={key} value={value} onChange={handleInputChange} required />
            ) : (
              <textarea key={key} name={key} placeholder="Información adicional" value={value} onChange={handleInputChange} rows={3} />
            )
          )}

          <h3>Forma de pago</h3>
          {config.mercadoPagoCheck && <label><input type="radio" name="paymentMethod" value="mercado_pago" checked={paymentMethod === 'mercado_pago'} onChange={handlePaymentMethodChange} /> Mercado Pago</label>}
          {config.transferenciaCheck && <label><input type="radio" name="paymentMethod" value="transferencia" checked={paymentMethod === 'transferencia'} onChange={handlePaymentMethodChange} /> Transferencia bancaria — {config.transferenciaTexto}</label>}
          {config.efectivoCheck && <label><input type="radio" name="paymentMethod" value="efectivo" checked={paymentMethod === 'efectivo'} onChange={handlePaymentMethodChange} /> Efectivo — {config.efectivoTexto}</label>}

          <button className="btn-confirmar-compra" type="submit">Confirmar Compra</button>
          {message && <p style={{ color: messageType === 'success' ? 'green' : 'red', textAlign: 'center' }}>{message}</p>}
        </form>
      </div>
    </>
  );
}
