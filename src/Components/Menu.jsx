import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Menu.css';

export default function Menu() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  return (
    <aside className="menu-filtros">
      <h2>Categorías</h2>
      <ul className="menu-categorias">
          <li><a href="/busqueda">Ver todos</a></li>
          {categorias.map(cat => (
          <li key={cat._id}>
            <Link to={`/busqueda?categoria=${cat._id}`} >{cat.nombre}</Link>
          </li>
        ))}
      </ul>
    </aside>

  );
}