import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { fetchWithRefresh } from '../api'; // 👈 importamos nuestro wrapper

export default function Registro() {
  const [form, setForm] = useState({
    mail: '',
    nombre: '',
    telefono: '',
    contra: ''
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetchWithRefresh('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      alert('Usuario registrado correctamente');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Registro</h2>
        {error && <p className="error">{error}</p>}

        <label>
          Email:
          <input type="email" name="mail" value={form.mail} onChange={handleChange} required />
        </label>

        <label>
          Nombre:
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>

        <label>
          Teléfono:
          <input type="number" name="telefono" value={form.telefono} onChange={handleChange} required />
        </label>

        <label>
          Contraseña:
          <input type="password" name="contra" value={form.contra} onChange={handleChange} required />
        </label>

        <button type="submit">Registrarse</button>
      </form>

      <a href="/login" className="boton-link"><button>Login</button></a>
      <a href="/" className="boton-link"><button>Continuar Anónimo</button></a>
    </div>
  );
}
