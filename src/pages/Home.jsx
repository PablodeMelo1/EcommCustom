import { useEffect, useState } from 'react';
import Catalogo from '../Components/Catalogo';
import CatalogoList from '../Components/CatalogoList';
import Nav from '../Components/Nav';
import Footer from '../Components/Footer';
import Menu from '../Components/Menu';
import { fetchWithRefresh } from '../api';  // <-- importar tu helper

import '../styles/Home.css'; 

export default function Home() {
  const [config, setConfig] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productosEnOferta, setProductosEnOferta] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const res = await fetchWithRefresh('/api/v1/config');
        if (!res.ok) throw new Error('Error al cargar config');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarConfig();
  }, []);

  useEffect(() => {
        const cargarProductos = async () => {
            try {
                const res = await fetchWithRefresh('/api/v1/productos');
                if (!res.ok) throw new Error('Error al cargar productos');
                const data = await res.json();

                // Guarda la lista completa y luego filtra
                setProductos(data);
                setProductosEnOferta(data.filter(prod => prod.oferta));
                setProductosDestacados(data.filter(prod => prod.destacado));
            } catch (err) {
                console.error(err);
            }
        };
        cargarProductos();
    }, []);
  if (!config) {
    return <div>Cargando...</div>;
  }
  return (
    <div style={{
      background: "#f8f8f8",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Nav />

      <div style={{
        background: config.colorPrincipal,
        color: '#fff',
        padding: '20px 20px',
        textAlign: 'center'
      }}>
        <p style={{color: config.fuentePrincipal, fontSize: '20px', fontWeight:'600'}}>{config.bannerTexto}</p>
        <a href="#comprar"><button style={{
          background: '#fff', color: config.colorPrincipal,
          border: 'none', padding: '10px 20px',
          marginTop: '20px', fontSize: '1rem', cursor: 'pointer'
        }}>
          Comprar ahora
        </button></a>
      </div>

      
      <main style={{ flex: 1 }}>
        <div className='contenedor-body' id="comprar">
          <Menu /> 
          <div className="catalogo-wrapper"> {/* <-- Nuevo contenedor */}
            {config.tipoCatalogo === "grid" && <Catalogo productosEnOferta={productosEnOferta}
                                                          productosDestacados={productosDestacados}
                                                          todosLosProductos={productos} color={config.colorPrincipal} />}
            {config.tipoCatalogo === "list" && <CatalogoList productosEnOferta={productosEnOferta}
                                                          productosDestacados={productosDestacados}
                                                          todosLosProductos={productos} color={config.colorPrincipal} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
