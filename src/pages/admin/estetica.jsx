import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../../api';

// Centralizamos la URL

export const BASE_URL = process.env.REACT_APP_BASE_URL_API;
const CONFIG_URL = '/api/v1/config';


export default function Estetica() {
    const [config, setConfig] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [logoFile, setLogoFile] = useState(null); // Nuevo estado para el archivo del logo

    const [form, setForm] = useState({
        logoUrl: '',
        colorNav: '',
        colorPrincipal: '',
        fuentePrincipal: '',
        nombreTienda: '',
        bannerTexto: '',
        tipoCatalogo: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            navigate('/');
            return;
        }

        async function loadConfig() {
            try {
                const res = await fetchWithRefresh(CONFIG_URL);
                if (!res.ok) throw new Error('Error al cargar la configuración');
                const data = await res.json();
                setConfig(data);
                setForm(data);
            } catch (err) {
                console.error('Error al cargar config:', err);
                setMessage('Error al cargar configuración ❌');
                setMessageType('error');
            }
        }

        loadConfig();
    }, [navigate]);

    function handleChange(e) {
            setForm({ ...form, [e.target.name]: e.target.value });
        }

        // Nuevo manejador de cambio para el archivo del logo
        function handleFileChangeLogo(e) {
            setLogoFile(e.target.files[0]);
        }



        async function handleSubmit(e) {
            e.preventDefault();
            setMessage('');
            setMessageType('');

            try {
                const formData = new FormData();
                
                // Agrega el archivo del logo si se seleccionó uno
                if (logoFile) {
                    formData.append('logo', logoFile);
                }
                
                // Agrega el resto de los campos del formulario
                for (const key in form) {
                    // Ignora el campo logoUrl, ya que la lógica la maneja el backend
                    // El backend se encargará de mantener la URL si no se sube un archivo
                    if (key !== 'logoUrl') {
                        const value = form[key];
                        
                        // Si el valor es un objeto o array, lo convertimos a JSON
                        if (typeof value === 'object' && value !== null) {
                            formData.append(key, JSON.stringify(value));
                        } else {
                            formData.append(key, value);
                        }
                    }
                }

                const res = await fetchWithRefresh(CONFIG_URL, {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Error al guardar');

                setForm(data.config); 
                setMessage(data.message || 'Cambios guardados correctamente ✅');
                setMessageType('success');
                // Vuelve a llenar el estado de logoFile a null para evitar reenvíos
                setLogoFile(null);
                
            } catch (error) {
                setMessage(error.message || 'Error al guardar los cambios ❌');
                setMessageType('error');
            }
        }


    if (!config) return <p className="cargando">Cargando configuración...</p>;

    return (
        <div className="config-container">
            <h1>¡Bienvenido Administrador!</h1>
            <h2>Panel de configuración</h2>
            
            {/* Muestra el logo actual si existe */}
            {config.logoUrl && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h3>Logo actual:</h3>
                    <img
                        src={`${BASE_URL}${config.logoUrl}`}
                        alt="Logo de la tienda"
                        style={{ maxWidth: '100px', height: 'auto' }}
                        
                    />
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label>
                    Subir nuevo logo:
                    <input type="file" name="logo" onChange={handleFileChangeLogo} accept="image/*" />
                </label>

                <label>
                    Color barra de navegación:
                    <input type="color" name="colorNav" value={form.colorNav} onChange={handleChange} />
                </label>

                <label>
                    Color principal:
                    <input type="color" name="colorPrincipal" value={form.colorPrincipal} onChange={handleChange} />
                </label>

                <label>
                    Color de fuente:
                    <select name="fuentePrincipal" value={form.fuentePrincipal} onChange={handleChange}>
                        <option value="#000">Negro</option>
                        <option value="#fff">Blanco</option>
                    </select>
                </label>

                <label>
                    Nombre tienda:
                    <input type="text" name="nombreTienda" value={form.nombreTienda} onChange={handleChange} />
                </label>

                <label>
                    Texto banner:
                    <input type="text" name="bannerTexto" value={form.bannerTexto} onChange={handleChange} />
                </label>

                <label>
                    Tipo catálogo:
                    <select name="tipoCatalogo" value={form.tipoCatalogo} onChange={handleChange}>
                        <option value="grid">Cuadrícula</option>
                        <option value="list">Lista</option>
                    </select>
                </label>

                <button type="submit">Guardar cambios</button>
            </form>

            {message && (
                <p
                    style={{
                        color: messageType === 'success' ? 'green' : 'red',
                        textAlign: 'center',
                    }}
                >
                    {message}
                </p>
            )}

            <div className="volver">
                <a href="/admin">&larr; Volver al inicio</a>
            </div>
        </div>
    );
}