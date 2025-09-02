import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Nav from '../Components/Nav';
import Footer from '../Components/Footer';
import { fetchWithRefresh } from '../api';
import '../styles/CheckoutExito.css';

export default function CheckoutExito() {
  const [pedido, setPedido] = useState(null);
  const [config, setConfig] = useState(null);
  const [mensajeMP, setMensajeMP] = useState('cargando');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    localStorage.removeItem('carrito');

    const pedidoId = searchParams.get('pedidoId');
    if (!pedidoId) {
      navigate('/');
      return;
    }

    const cargarPedido = async () => {
      try {
        const res = await fetchWithRefresh(`/api/pedidos/${pedidoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar pedido');
        const data = await res.json();
        setPedido(data);
        
        // Lógica para Mercado Pago
        if (data.paymentMethod === 'mercado_pago') {
          switch (data.estado) {
            case 'pago':
              setMensajeMP('pago_exitoso');
              break;
            case 'en_proceso':
              setMensajeMP('pago_en_proceso');
              break;
            case 'fallido':
              setMensajeMP('pago_fallido');
              break;
            default:
              setMensajeMP('pago_desconocido');
              break;
          }
        }
      } catch (err) {
        console.error(err);
        navigate('/');
      }
    };

    const cargarConfig = async () => {
      try {
        const res = await fetchWithRefresh('/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar config');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error(err);
      }
    };

    cargarPedido();
    cargarConfig();
  }, [searchParams, navigate, token]);

  if (!pedido || !config) {
    return (
      <div className="checkout-container">
        <Nav />
        <h2>Cargando pedido...</h2>
      </div>
    );
  }

  const metodosTransferencia = config.transferenciaCuentas || [];

  const renderContenido = () => {
    if (pedido.paymentMethod === 'transferencia') {
      return (
        <div className="checkout-card">
          <h1>Pedido #{pedido.numeroPedido}</h1>
          <p className="success-text">Gracias por tu pedido. En breve nos pondremos en contacto.</p>
          <p>Para completar el pago, realiza una transferencia a alguna de las siguientes cuentas:</p>
          <p>*ingresa como referencia el id del pedido</p>
          <h2>Monto: ${pedido.total}</h2>
          {metodosTransferencia.length > 0 ? (
            <table className="tabla-cuentas">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Banco</th>
                  <th>Número de cuenta</th>
                </tr>
              </thead>
              <tbody>
                {metodosTransferencia.map((cuenta, index) => (
                  <tr key={index}>
                    <td>{cuenta.nombre}</td>
                    <td>{cuenta.banco}</td>
                    <td>{cuenta.numeroCuenta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay cuentas de transferencia configuradas.</p>
          )}
        </div>
      );
    } else if (pedido.paymentMethod === 'mercado_pago') {
      switch (mensajeMP) {
        case 'pago':
          return (
            <div className="checkout-card success-card">
              <h1 className="emoji-title">✅ ¡Compra Exitosa!</h1>
              <p>Tu pago ha sido procesado correctamente. Gracias por tu pedido.</p>
              <h2>Pedido #{pedido.numeroPedido}</h2>
              <p>El total fue de: ${pedido.total}</p>
            </div>
          );
        case 'en_proceso':
          return (
            <div className="checkout-card pending-card">
              <h1 className="emoji-title">⏳ Pago en Proceso</h1>
              <p>Tu pago está siendo procesado por Mercado Pago. Te notificaremos cuando se acredite.</p>
              <h2>Pedido #{pedido.numeroPedido}</h2>
              <p>El total fue de: ${pedido.total}</p>
            </div>
          );
        case 'fallido':
          return (
            <div className="checkout-card error-card">
              <h1 className="emoji-title">❌ Pago Rechazado</h1>
              <p>Hubo un problema con tu pago. Por favor, revisa tus datos o intenta con otro método.</p>
              <h2>Pedido #{pedido.numeroPedido}</h2>
            </div>
          );
        case 'desconocido':
          return (
            <div className="checkout-card">
              <h1>Estado de pago desconocido</h1>
              <p>No pudimos verificar el estado de tu pago. Por favor, revisa tu historial de compras.</p>
              <h2>Pedido #{pedido.numeroPedido}</h2>
            </div>
          );
        default:
          return <p>Verificando estado del pago...</p>;
      }
    } else {
      return (
        <div className="checkout-card">
          <h1>Gracias por tu pedido</h1>
          <p className="success-text">Pedido #{pedido.numeroPedido}</p>
          <p>En breve nos pondremos en contacto.</p>
          <h2>Monto: ${pedido.total}</h2>
        </div>
      );
    }
  };

  return (
    <>
      <Nav />
      <div className="checkout-container">
        {renderContenido()}
        <a href="/" className="btn-volver">Seguir navegando</a>
      </div>
      <Footer />
    </>
  );
}