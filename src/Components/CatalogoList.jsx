import '../styles/Catalogos.css'
export const BASE_URL = process.env.REACT_APP_BASE_URL_API;
export default function CatalogoList({ productosEnOferta, productosDestacados, todosLosProductos }) {

  // Función para renderizar una sección de productos
  const renderizarSeccion = (titulo, productos) => {
    if (!productos || productos.length === 0) {
      return null; // no muestra nada si no hay productos
    }

    return (
      <div className="seccion-catalogo">
        <h2>{titulo}</h2>
        <div className="catalogo-list">
          {productos.slice(0, 24).map(prod => (
            <a href={`/producto/${prod._id}`} key={prod._id}>
              <div className="producto">
                <img src={`${BASE_URL}${prod.img}`} alt={prod.nombre} />
                <div className="info">
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
                </div>
              </div>
            </a>
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
      {renderizarSeccion("Todos los Productos", todosLosProductos)}
    </>
  );
}
