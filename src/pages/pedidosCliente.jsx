import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Components/Nav';
import '../styles/pedidos.css';
import { fetchPedidosCliente } from '../api';

export default function PedidosCliente() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPedidos() {
      try {
        const data = await fetchPedidosCliente();
        if (Array.isArray(data)) setPedidos(data);
        else setPedidos([]);
      } catch (err) {
        console.error(err);
        navigate('/login'); // si no está autenticado
      }
    }

    loadPedidos();
  }, [navigate]);

  function abrirModalDetalle(pedido) {
    setPedidoDetalle(pedido);
  }

  function cerrarModal() {
    setPedidoDetalle(null);
  }

  return (
    <>
      <Nav/>
      <div className="pedidos-container">
        <h2>Mis Pedidos</h2>
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Tipo de entrega</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p._id}>
                <td>{p.numeroPedido}</td>
                <td>{new Date(p.fecha).toLocaleString()}</td>
                <td>${p.total}</td>
                <td>{p.estado}</td>
                <td>{p.tipoEntrega}</td>
                <td>
                  <button onClick={() => abrirModalDetalle(p)} className="btn-detalle">
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
                    <th>Color</th>
                    <th>Talle</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoDetalle.items.map(item => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.color || "N/A"}</td>
                      <td>{item.talle || "N/A"}</td>
                      <td>${item.price}</td>
                      <td>${item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
