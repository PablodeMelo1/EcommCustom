// src/pages/Carrito.jsx
import React, { useEffect, useState } from 'react';
import '../styles/Carrito.css';
import Nav from '../Components/Nav'; 

function Carrito() {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(data);
  }, []);

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) cantidad = 1; // mínimo 1
    const actualizado = carrito.map(item =>
      item.productId === id ? { ...item, quantity: cantidad } : item
    );
    setCarrito(actualizado);
    localStorage.setItem('carrito', JSON.stringify(actualizado));
  };

  const eliminarProducto = (id) => {
    const nuevoCarrito = carrito.filter(item => item.productId !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  };

  const calcularTotal = () =>
    carrito.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <Nav />
      <div className="carrito-container">
        <h2>🛒 Carrito de compras</h2>

        {carrito.length === 0 ? (
          <p className="carrito-empty">Tu carrito está vacío</p>
        ) : (
          <table className="carrito-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) =>
                        actualizarCantidad(item.productId, parseInt(e.target.value))
                      }
                    />
                  </td>
                  <td>${(item.price * item.quantity)}</td>
                  <td>
                    <button onClick={() => eliminarProducto(item.productId)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {carrito.length > 0 && (
          <>
            <h3 className="carrito-total">Total: ${calcularTotal()}</h3>
            <a className="btn-confirmar-compra" href="/checkout">Confirmar Compra</a>
          </>
        )}

      </div>
    </>
  );
}

export default Carrito;
