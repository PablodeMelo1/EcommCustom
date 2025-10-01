import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Catalogo from '../Components/Catalogo';
import Nav from '../Components/Nav';
import '../styles/producto.css';
import { fetchWithRefresh } from '../api';
export const BASE_URL = process.env.REACT_APP_BASE_URL_API;

export default function Producto({ config }) {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [message2, setMessage2] = useState('');
  const [messageType2, setMessageType2] = useState('');
  const [productos, setProductos] = useState([]);
  const [productosEnOferta, setProductosEnOferta] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [productosRandom, setProductosRandom] = useState([]); // <<--- nuevo
  const [nuevoComentario, setNuevoComentario] = useState({
    nombre: localStorage.getItem('nombre'),
    mensaje: '',
    puntuacion: 5
  });

  const rol = localStorage.getItem('role') || 'user';

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetchWithRefresh('/api/v1/productos');
        if (!res.ok) throw new Error('Error al cargar productos');
        const data = await res.json();

        setProductos(data);
        setProductosEnOferta(data.filter(prod => prod.oferta));
        setProductosDestacados(data.filter(prod => prod.destacado));

        // <<<--- Elegir 4 productos random UNA VEZ
        const seleccionados = [...data].sort(() => Math.random() - 0.5).slice(0, 4);
        setProductosRandom(seleccionados);

      } catch (err) {
        console.error(err);
      }
    };
    cargarProductos();
  }, []);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedTalle, setSelectedTalle] = useState('');

  // Cargar producto y comentarios
  useEffect(() => {
    const cargarProductoYComentarios = async () => {
      try {
        const resProd = await fetchWithRefresh(`/api/v1/productos/${id}`);
        const dataProd = await resProd.json();
        setProducto(dataProd);

        const resCom = await fetchWithRefresh(`/api/v1/productos/${id}/comentarios`);
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


  //metodo compártir producto
  const compartirProducto = () => {
    if (navigator.share) {
      navigator.share({
        title: producto.nombre,
        text: `Mirá este producto: ${producto.nombre}`,
        url: window.location.href
      })
        .then(() => console.log('Compartido con éxito'))
        .catch(err => console.error('Error al compartir:', err));
    } else {
      alert("Tu navegador no soporta compartir directamente.");
    }
  };


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
      const res = await fetchWithRefresh(`/api/v1/productos/${producto._id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoComentario)
      });

      if (res.ok) {
        setNuevoComentario({ nombre: localStorage.getItem('nombre'), mensaje: '', puntuacion: 5 });
        const dataCom = await (await fetchWithRefresh(`/api/v1/productos/${producto._id}/comentarios`)).json();
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

  function handleConfirmarEliminarComentario(id) {
    setConfirmDeleteId(id);
  }




  //eliminar comentario
  async function handleEliminarComentario(productId, commentId) {
    try {
      const res = await fetchWithRefresh(`/api/v1/productos/${productId}/comentarios/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar el comentario');

      // 👇 actualizamos el estado para quitarlo al instante
      setComentarios(prev =>
        prev.filter(c => c._id !== commentId)
      );

      setMessageType('success');
      setMessage('Comentario eliminado correctamente');
    } catch (err) {
      setMessageType('error');
      setMessage('Error al eliminar: ' + err.message);
    } finally {
      setConfirmDeleteId(null);
    }
  }


  if (loading || !config) return <p className="loading">Cargando producto...</p>;
  if (!producto) return <p className="error">Producto no encontrado.</p>;



  return (
    <>
      <Nav />
      <div className="producto-container" style={{ "--color-principal": config.colorPrincipal }}>
        <div className="producto-main">
          <div className="producto-img">
            <img src={`${BASE_URL}${producto.img}`} alt={producto.nombre} />
          </div>

          <div className="producto-info">
            <h1>{producto.nombre}</h1>
            {producto.oferta && producto.precioFinal ? (
              <h2 className='precio'>

                <div className='off'>
                  {producto.descuento}% OFF
                </div>

                <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '5px' }}>
                  ${producto.precio}
                </span>
                <span style={{ color: '#009b5a' }}>${producto.precioFinal}</span>
              </h2>
            ) : (
              <p className='prodPrecio'>${producto.precio}</p>
            )}


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
            <button onClick={compartirProducto} className="compartir" alt="compartir">
              ➦
            </button>

            <p className="descripcion">{producto.descripcion}</p>

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


              {/* borrar comentario */}
              {rol === 'admin' && (confirmDeleteId === c._id ? (
                <div className="chip-actions">
                  <button
                    onClick={() => handleEliminarComentario(producto._id, c._id)}
                    className="btn-confirm-delete"
                  >
                    ✔
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="btn-cancel-delete"
                  >
                    ✖
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConfirmarEliminarComentario(c._id)}
                  className="btn-delete"
                >
                  🗑
                </button>
              )
              )}

            </div>
          ))}

          {/* fin borrar comentario */}

          <Catalogo
            productosEnOferta={null}
            productosDestacados={null}
            todosLosProductos={productosRandom}
            color={config.colorPrincipal}
          />

        </div>
      </div>
    </>
  );
}
