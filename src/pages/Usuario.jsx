import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

export default function Usuario() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', contra: '' });
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const nombre = localStorage.getItem('nombre');

    if (token && role && nombre) {
      setUser({ nombre, role }); 
      
    } else ;
  }, []);


  if (user) {
    return (
      <div className="login-container">
        <h2>Bienvenido, {user.nombre}</h2>
        <a href="/" className="boton-link"><button>Navegar</button></a>

        <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); setUser(null); navigate("../login")}}>   
          Logout
        </button>
      </div>
    );
  }


}
