import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchWithRefresh } from '../api';
import Nav from '../Components/Nav';
import Catalogo from '../Components/Catalogo';
import CatalogoList from '../Components/CatalogoList';
import Footer from '../Components/Footer';
import Menu from '../Components/Menu';
import '../styles/Home.css'; 

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Busqueda() {
  const [productos, setProductos] = useState([]);
  const [prodSugeridos, setProductosSugeridos] = useState([]);
  const [config, setConfig] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const query = useQuery();

  const nombreBuscado = query.get("nombre")?.toLowerCase() || "";
  const precioBuscado = parseFloat(query.get("precio")) || Infinity;
  const categoriaBuscada = query.get("categoria") || null;

  useEffect(() => {
    async function cargarConfigYCategorias() {
      try {
        const resConfig = await fetchWithRefresh('/api/v1/config');
        const dataConfig = await resConfig.json();
        setConfig(dataConfig);

        const resCats = await fetchWithRefresh('/api/v1/categorias');
        const dataCats = await resCats.json();
        setCategorias(dataCats);

      } catch (err) {
        console.error(err);
      }
    }

    cargarConfigYCategorias();
  }, []);

  useEffect(() => {
    async function cargarProductos() {
      setCargando(true);
      try {
        const res = await fetchWithRefresh('/api/v1/productos');
        const data = await res.json();
        setProductosSugeridos(data);

        const filtrados = data.filter(p => {
          const nombreCoincide =
            nombreBuscado === "" || p.nombre.toLowerCase().includes(nombreBuscado) || p.descripcion.toLowerCase().includes(nombreBuscado);

          const precioCoincide = p.precio <= precioBuscado;
          const categoriaCoincide = !categoriaBuscada || p.categoria === categoriaBuscada;

          return nombreCoincide && precioCoincide && categoriaCoincide;
        });

        setProductos(filtrados);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, [nombreBuscado, precioBuscado, categoriaBuscada]);

  return (
    <div className='contenedor-main' style={{background: '#f8f8f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <main style={{ flex: 1 }}>
        <div className='contenedor-body-busqueda' style={{ display: 'flex', gap: '1rem' }}>
          <Menu />

          <div className="contenedor-body">
            {cargando ? (
              <p>Cargando productos...</p>
            ) : productos.length > 0 ? (
              config?.tipoCatalogo === "grid" ? (
                <Catalogo 
                  productosEnOferta={[]} // acá podés armar lógica de ofertas si querés
                  productosDestacados={[]} // idem para destacados
                  todosLosProductos={productos}
                  color={config?.colorPrincipal}
                />
              ) : (
                <CatalogoList 
                  productosEnOferta={[]} 
                  productosDestacados={[]} 
                  todosLosProductos={productos}
                  color={config?.colorPrincipal}
                />
              )
            ) : (
              <div className='sin-encontrar'>
                <p>No se encontraron productos.</p>
                <h3>Productos que te podrían interesar:</h3>
                <CatalogoList 
                  productosEnOferta={[]} 
                  productosDestacados={[]} 
                  todosLosProductos={[...prodSugeridos].sort(() => 0.5 - Math.random()).slice(0, 4)}
                  color={config?.colorPrincipal}
                />
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
