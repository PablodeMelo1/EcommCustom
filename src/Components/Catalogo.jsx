import '../styles/Catalogos.css'


// El componente Catalogo ahora recibe las listas filtradas
export default function Catalogo({ productosEnOferta, productosDestacados, todosLosProductos }) {
//trae el base URL del .env
const baseURL = process.env.REACT_APP_BASE_URL_API;

  // Función para renderizar una sección de productos
  const renderizarSeccion = (titulo, productos) => {
    // Si no hay productos, no renderiza la sección
    if (!productos || productos.length === 0) {
      return null;
    }

    // Si hay productos, renderiza el título y el grid
    return (
      <div className="seccion-catalogo">
        <h2>{titulo}</h2>
        <div className="catalogo-grid">
          
          {productos.map(prod => (
            <div key={prod._id} className="producto">
              <a href={`/producto/${prod._id}`}>
                {prod.img && <img src={prod.img} alt={prod.nombre} className="table-img" />}
                <h3>{prod.nombre}</h3>
                {prod.oferta && prod.precioFinal ? (
                  <>
                  <div className='offCard'>
                    {prod.descuento}% OFF
                  </div>
                  <p>
                    <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '5px' }}>
                      ${prod.precio}
                    </span>
                    <span style={{ color: 'green' }}>${prod.precioFinal}</span>
                  </p>
                  </>
                ) : (
                  <p>${prod.precio}</p>
                )}
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sección de Productos en Oferta */}
      {renderizarSeccion("Productos en Oferta", productosEnOferta)}

      {/* Sección de Productos Destacados */}
      {renderizarSeccion("Productos Destacados", productosDestacados)}

      {/* Sección del Catálogo General */}
      {renderizarSeccion("Todos los Productos", todosLosProductos.slice(0, 20))}
    </>
  );
}