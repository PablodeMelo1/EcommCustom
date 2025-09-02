import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../../api';
import '../../styles/pedidos.css';

const PEDIDOS_URL = '/api/pedidos';
const token = localStorage.getItem('token');

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {

    const role = localStorage.getItem('role');
      if (role !== 'admin') {
        navigate('/');
        return;
      }

      async function loadPedidos() {
        const token = localStorage.getItem('token'); // leer aquí
        try {
          const res = await fetchWithRefresh(PEDIDOS_URL, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        if (!res.ok) throw new Error('Error al cargar pedidos');
        const data = await res.json();
        if (Array.isArray(data)) {
          setPedidos(data);
          if (data.length === 0) {
            setMessage('No hay pedidos disponibles.');
            setMessageType('info');
          }
        } else {
          setMessage('Error al cargar pedidos.');
          setMessageType('error');
          setPedidos([]);
        }
      } catch (err) {
        setMessage('Error al conectar con el servidor: ' + err.message);
        setMessageType('error');
      }
    }

    loadPedidos();
  }, [navigate]);

  async function handleEstadoChange(pedidoId, nuevoEstado) {
    try {
      const res = await fetchWithRefresh(`${PEDIDOS_URL}/${pedidoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });


      if (!res.ok) throw new Error('Error al actualizar el estado');

      setPedidos(prev =>
        prev.map(p =>
          p._id === pedidoId ? { ...p, estado: nuevoEstado } : p
        )
      );
      setMessage('Estado actualizado correctamente.');
      setMessageType('success');
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  }

  function abrirModalDetalle(pedido) {
    setPedidoDetalle(pedido);
  }

  function cerrarModal() {
    setPedidoDetalle(null);
  }

  return (
    <div className="pedidos-container">
      <h2>Administrar pedidos</h2>

      {message && (
        <p style={{
          color: messageType === 'success' ? 'green' :
                 messageType === 'error' ? 'red' : 'blue',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}

      {pedidos.length > 0 ? (
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Dirección</th>
              <th>Modificar</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p._id}>
                <td>{p.userId?.nombre || 'Desconocido'}</td>
                <td>{p.userId?.nroTelefono || 'Desconocido'}</td>
                <td>{p.userId?.mail || 'Desconocido'}</td>
                <td>{new Date(p.fecha).toLocaleString()}</td>
                <td>${p.total}</td>
                <td>{p.estado}</td>
                <td>
                  {p.direccion}, {p.numeroCasa} ({p.tipoCasa}), {p.ciudad}, {p.departamento}
                </td>
                <td>
                  <select
                    value={p.estado}
                    onChange={e => handleEstadoChange(p._id, e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pago">Pago</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => abrirModalDetalle(p)} className="btn-detalle">
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', fontStyle: 'italic' }}>No hay pedidos disponibles.</p>
      )}

      {pedidoDetalle && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Detalle del Pedido</h3>
            <button className="modal-close" onClick={cerrarModal}>
              &times;
            </button>
            <table className="detalle-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedidoDetalle.items.map(item => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="volver">
        <a href="/admin">&larr; Volver</a>
      </div>
    </div>
  );
}
