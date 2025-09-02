import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../Components/Nav'; 
import '../styles/producto.css';
import { fetchWithRefresh } from '../api';

export default function Producto({ config }) {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [message2, setMessage2] = useState('');
  const [messageType2, setMessageType2] = useState('');

  const [nuevoComentario, setNuevoComentario] = useState({
    nombre: localStorage.getItem('nombre'),
    mensaje: '',
    puntuacion: 5
  });

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedTalle, setSelectedTalle] = useState('');

  // Cargar producto y comentarios
  useEffect(() => {
    const cargarProductoYComentarios = async () => {
      try {
        const resProd = await fetchWithRefresh(`/api/productos/${id}`);
        const dataProd = await resProd.json();
        setProducto(dataProd);

        const resCom = await fetchWithRefresh(`/api/productos/${id}/comentarios`);
        const dataCom = await resCom.json();
        setComentarios(dataCom);
      } catch (err) {
        console.error('Error al cargar producto o comentarios:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarProductoYComentarios();
  }, [id]);

  // Agregar al carrito (solo LocalStorage)
  const agregarAlCarrito = () => {
    if (producto.coloresCheck && !selectedColor) {
      setMessage('Por favor selecciona un color');
      setMessageType('error');
      return;
    }
    if (producto.tallesCheck && !selectedTalle) {
      setMessage('Por favor selecciona un talle');
      setMessageType('error');
      return;
    }

    const precioAplicado = producto.oferta && producto.precioFinal ? producto.precioFinal : producto.precio;
    const nuevoItem = {
      productId: producto._id,
      name: producto.nombre,
      price: precioAplicado,
      image: producto.img || 'https://via.placeholder.com/500',
      quantity: 1,
      color: selectedColor || null,
      talle: selectedTalle || null
    };

    const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carritoLocal.findIndex(item =>
      item.productId === nuevoItem.productId &&
      item.color === nuevoItem.color &&
      item.talle === nuevoItem.talle
    );

    if (index !== -1) {
      carritoLocal[index].quantity += 1;
    } else {
      carritoLocal.push(nuevoItem);
    }

    localStorage.setItem("carrito", JSON.stringify(carritoLocal));
    setMessage(`Se agregó ${nuevoItem.name} al carrito.`);
    setMessageType('success');
  };

  // Comentarios
  const handleChangeComentario = (e) => {
    const { name, value } = e.target;
    setNuevoComentario(prev => ({ ...prev, [name]: value }));
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithRefresh(`/api/productos/${producto._id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoComentario)
      });

      if (res.ok) {
        setNuevoComentario({ nombre: localStorage.getItem('nombre'), mensaje: '', puntuacion: 5 });
        const dataCom = await (await fetchWithRefresh(`/api/productos/${producto._id}/comentarios`)).json();
        setComentarios(dataCom);
        setMessage2('¡Gracias por tu comentario!');
        setMessageType2('success');
      } else {
        setMessage2('Error al ingresar el comentario');
        setMessageType2('error');
      }
    } catch (err) {
      console.error(err);
      setMessage2('Error al enviar comentario');
      setMessageType2('error');
    }
  };

  if (loading || !config) return <p className="loading">Cargando producto...</p>;
  if (!producto) return <p className="error">Producto no encontrado.</p>;

  return (
    <>
      <Nav />
      <div className="producto-container" style={{ "--color-principal": config.colorPrincipal }}>
        <div className="producto-main">
          <div className="producto-img">
            <img src={`http://localhost:3001${producto.img}`} alt={producto.nombre} />
          </div>

          <div className="producto-info">
            <h1>{producto.nombre}</h1>
            {producto.oferta && producto.precioFinal ? (
              <h2>
                <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '5px' }}>
                  ${producto.precio}
                </span>
                <span style={{ color: 'green' }}>${producto.precioFinal}</span>
              </h2>
            ) : (
              <p className='prodPrecio'>${producto.precio}</p>
            )}
            <p className="descripcion">{producto.descripcion}</p>

            {producto.coloresCheck && (
              <div className="selector">
                <label>Color:</label>
                <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)}>
                  <option value="">Selecciona un color</option>
                  {producto.colores.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
            {producto.tallesCheck && (
              <div className="selector">
                <label>Talle:</label>
                <select value={selectedTalle} onChange={e => setSelectedTalle(e.target.value)}>
                  <option value="">Selecciona un talle</option>
                  {producto.talles.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <button className="comprar" onClick={agregarAlCarrito}>Añadir al carrito</button>
            {message && (
              <h3 style={{ color: messageType === 'success' ? 'green' : 'red', textAlign: 'left' }}>
                {message}
              </h3>
            )}
          </div>
        </div>

        <div className="producto-comentarios">
          <form onSubmit={handleEnviarComentario} className="comentario-form">
            <h3>Dejá tu opinión</h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  className={`star ${n <= nuevoComentario.puntuacion ? 'selected' : ''}`}
                  onClick={() => setNuevoComentario(prev => ({ ...prev, puntuacion: n }))}
                  style={{ cursor: 'pointer', fontSize: '24px', color: n <= nuevoComentario.puntuacion ? '#FFD700' : '#ccc' }}
                >
                  ★
                </span>
              ))}
              <br />
              <textarea
                name="mensaje"
                placeholder="Escribí tu comentario"
                value={nuevoComentario.mensaje}
                onChange={handleChangeComentario}
                required
              />
            </div>
            <button className='comentario-boton' type="submit">Enviar</button>
            {message2 && (
              <p style={{ color: messageType2 === 'success' ? 'green' : 'red', textAlign: 'left' }}>
                {message2}
              </p>
            )}
          </form>

          <h3>Opiniones sobre el producto</h3>
          {comentarios.length === 0 && <p>No hay comentarios aún.</p>}
          {comentarios.map((c, i) => (
            <div key={i} className="comentario">
              <p><strong>{c.nombre}</strong> {'⭐'.repeat(c.puntuacion)}</p>
              <p>{c.mensaje}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
