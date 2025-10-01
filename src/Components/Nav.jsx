import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; 
import { FaCartShopping } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";

export const BASE_URL = process.env.REACT_APP_BASE_URL_API;
var URLConfig = `${BASE_URL}/api/v1/config`;

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);
  const [config, setConfig] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Efecto para obtener la configuración y manejar clics fuera del menú
  useEffect(() => {
    fetch(URLConfig)
      .then(res => res.json())
      .then(data => setConfig(data));

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // **NUEVO**: Efecto para bloquear el scroll del body cuando el menú está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
    // Limpieza al desmontar el componente
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [menuOpen]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/busqueda?nombre=${encodeURIComponent(busqueda.trim())}`);
      setBusqueda("");
      setMenuOpen(false); // Cierra el menú al buscar
    }
  };

  const [categorias, setCategorias] = useState([]);
  
  useEffect(() => {
      fetch(`${BASE_URL}/api/v1/categorias`)
        .then(res => res.json())
        .then(data => setCategorias(data))
        .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  if (!config) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</p>;

  return (
    <div className='nav-container' style={{background: config.colorNav}}>
      <nav style={{ color: config.fuentePrincipal }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href="/"><img src={`${BASE_URL}${config.logoUrl}`} alt="Logo" style={{ height: '50px', marginRight: '10px' }} /></a>
          <h1 style={{ fontSize: '1.5rem' }}>{config.nombreTienda}</h1>
        </div>

        <div> 
          {/* **MODIFICADO**: Se añade la clase 'active' dinámicamente */}
          <div className={`hamburger ${menuOpen ? "active" : ""}`} ref={burgerRef} onClick={() => setMenuOpen(!menuOpen)}>
            <span style={{ background: config.fuentePrincipal }}></span>
            <span style={{ background: config.fuentePrincipal }}></span>
            <span style={{ background: config.fuentePrincipal }}></span>
          </div>

          <ul className={`nav-menu ${menuOpen ? "open" : ""}`} style={{ background: config.colorNav }} ref={menuRef}>
            {/* El buscador se mantiene para la vista de escritorio */}
            <form onSubmit={handleSubmit} className="form-busqueda" id="ocultarMobile">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
            </form>

            {/* Versión mobile del buscador, más prominente */}
            <form onSubmit={handleSubmit} className="form-busqueda-mobile" id="mostrarMobile">
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="input-busqueda-mobile"
                />
            </form>

            {token && (<a href="/pedidosCliente" className="nav-text" style={{ color: config.fuentePrincipal}}>MIS PEDIDOS</a>)}
            
            {/* Íconos para Desktop */}
            <a href="/carrito" className="nav-button" id='ocultarMobile' style={{ color: config.fuentePrincipal}}><FaCartShopping/></a>
            {!token && (<a href="/login" className="nav-button" id='ocultarMobile' style={{ color: config.fuentePrincipal}}><CiLogin/></a>)}
            {token && (<a href="/usuario" className="nav-button" id='ocultarMobile' style={{ color: config.fuentePrincipal}}><FaUser/></a>)}

            {/* Texto para Mobile */}
            <a href="/carrito" className="nav-text" id='mostrarMobile' style={{ color: config.fuentePrincipal}}>CARRITO</a>
            {!token && (<a href="/login" className="nav-text" id='mostrarMobile' style={{ color: config.fuentePrincipal}}>LOGIN</a>)}
            {token && (<a href="/usuario" className="nav-text" id='mostrarMobile' style={{ color: config.fuentePrincipal}}>USUARIO</a>)}

            <li className="menu-cats">
              <h2 className="categorias-title">Categorías</h2>
              <ul className="categorias-list">
                {categorias.map(cat => (
                  <li key={cat._id}>
                    <Link to={`/busqueda?categoria=${cat._id}`} className="categorias-item" onClick={() => setMenuOpen(false)}>
                      {cat.nombre}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/busqueda" className="categorias-item" onClick={() => setMenuOpen(false)}>Ver todos</Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}