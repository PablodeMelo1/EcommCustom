import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../api';
import '../styles/login.css';

export default function Usuario() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', contra: '' });
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const handleLogout = async () => {
    try {
      // 1. Notificar al backend para que elimine la cookie
      const res = await fetchWithRefresh('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        // 2. Limpiar el estado del frontend
        localStorage.removeItem('token');
        localStorage.removeItem('nombre'); 
        localStorage.removeItem('role'); 
        setUser(null);
        // 3. Redirigir al usuario
        navigate("/login");
      } else {
        console.error('Error al cerrar sesión en el backend');
      }
    } catch (error) {
      console.error('Error en el logout:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const nombre = localStorage.getItem('nombre');

    if (token && role && nombre) {
      setUser({ nombre, role });

    } else;
  }, []);


  if (user) {
    return (
      <div className="login-container">
        <h2>Bienvenido, {user.nombre}</h2>
        <a href="/" className="boton-link"><button>Navegar</button></a>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }


}
