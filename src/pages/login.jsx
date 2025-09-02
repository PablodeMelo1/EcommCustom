// login.jsx (versión corregida y validada)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { login, getCarrito, saveCarrito } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mail: '', contra: '' });
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Si el usuario se ha establecido, redirige a la página de usuario
    if (user) {
      navigate("/usuario");
    }
  }, [user, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      // 1. Iniciar sesión y obtener la respuesta
      const data = await login(form);

      // 2. Validar la respuesta del servidor antes de continuar
      if (!data || !data.usuario || !data.usuario._id) {
        throw new Error("Respuesta de login inválida o incompleta.");
      }

      // 3. Si la respuesta es válida, guardar los datos en localStorage y actualizar el estado
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('role', data.usuario.role);
      localStorage.setItem('nombre', data.usuario.nombre);
      setUser(data.usuario);

      // 4. Sincronizar carrito: ahora el userId está garantizado
      const localCart = JSON.parse(localStorage.getItem("carrito")) || [];
      const userId = data.usuario._id; // Usa una variable local para mayor claridad

      const backendCart = await getCarrito(userId);
      
      const mergedCart = [...localCart];
      backendCart.items?.forEach(item => {
        const existing = mergedCart.find(i => i.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          mergedCart.push(item);
        }
      });
      
      localStorage.setItem("carrito", JSON.stringify(mergedCart));
      await saveCarrito(userId, mergedCart);

    } catch (err) {
      console.error("Error en el proceso de login o sincronización:", err);
      setError(err.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    }
  }

  return (
    <div className='login-container'>
        <form onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          {error && <p className="error">{error}</p>}
          <label>
            Email:
            <input type="email" name="mail" value={form.mail} onChange={handleChange} required />
          </label>
          <label>
            Contraseña:
            <input type="password" name="contra" value={form.contra} onChange={handleChange} required />
          </label>
          <h3>No estas registrado?</h3>
          <a href="../registro">Registrarse</a>
          <button type="submit">Entrar</button>
        </form>
        <a href="/" className="boton-link">
          <button>Continuar Anónimo</button>
        </a>
    </div>
  );
}