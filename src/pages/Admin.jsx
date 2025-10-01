import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

export default function Admin() {
  const navigate = useNavigate();

  const cards = [
    { title: 'Estética', path: '/admin/estetica', size: 'medium' },
    { title: 'Redes Sociales', path: '/admin/redes', size: 'small' },
    { title: 'Metodos de Pago y Local', path: '/admin/pagos', size: 'small' },
    { title: 'Administrar Productos', path: '/admin/productos', size: 'small' },
    { title: 'Administrar Pedidos', path: '/admin/pedidos', size: 'small' },
    { title: 'Volver al inicio', path: '/', size: 'medium' },
  ];

  return (
    <div className="config-container">
      <h1>¡Bienvenido Administrador!</h1>
      <h2>Panel de configuración</h2>
      <div className="admin-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`card ${card.size}`}
            onClick={() => navigate(card.path)}
          >
            <h2>{card.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
