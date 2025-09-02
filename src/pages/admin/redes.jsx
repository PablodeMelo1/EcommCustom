import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../../api';

// URL centralizada
const CONFIG_URL = '/api/config';

export default function Redes() {
    const [config, setConfig] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [form, setForm] = useState({
        igCheck: false,
        xCheck: false,
        fbCheck: false,
        ttCheck: false,
        wpCheck: false,
        emailCheck: false,
        igTexto: '',
        xTexto: '',
        fbTexto: '',
        ttTexto: '',
        wpTexto: '',
        emailTexto: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            navigate('/');
            return;
        }

        async function cargarConfig() {
            try {
                const res = await fetchWithRefresh(CONFIG_URL);
                if (!res.ok) throw new Error('Error al cargar configuración');
                const data = await res.json();
                setConfig(data);
                setForm(data);
            } catch (err) {
                setMessageType('error');
                setMessage('Error al cargar configuración: ' + err.message);
            }
        }
        cargarConfig();
    }, [navigate]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    // Unificamos el manejo del checkbox para mayor limpieza
    function handleCheckboxChange(e) {
        const { name, checked } = e.target;
        setForm({ ...form, [name]: checked });
    }

    // En tu componente Redes.jsx, dentro de la función handleSubmit
    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            // Creamos una copia limpia del estado del formulario
            const formToSend = { ...form };

            // 🚨 CAMBIO CLAVE AQUÍ 🚨
            // Eliminamos las propiedades que no son relevantes para el formulario de redes
            // Esta es la solución más limpia y robusta.
            delete formToSend.logoUrl;
            delete formToSend.mercadoPagoCheck;
            delete formToSend.transferenciaCheck;
            delete formToSend.efectivoCheck;
            delete formToSend.transferenciaCuentas;

            const formData = new FormData();
            formData.append('formType', 'redes');

            // Iteramos sobre el objeto limpio
            for (const key in formToSend) {
                const value = formToSend[key];
                formData.append(key, value);
            }

            const res = await fetchWithRefresh(CONFIG_URL, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al guardar');

            setConfig(data);
            setForm(data); // Esto vuelve a cargar los datos completos, lo cual es correcto
            setMessage(data.message || 'Cambios guardados correctamente ✅');
            setMessageType('success');
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

            <form onSubmit={handleSubmit}>
                {['ig', 'x', 'fb', 'tt', 'wp', 'email'].map(red => (
                    <div className="metodosPago" key={red}>
                        <div className="metodoTitulo">
                            <h3>{red === 'x' ? 'X' : red.charAt(0).toUpperCase() + red.slice(1)}</h3>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    name={`${red}Check`}
                                    checked={form[`${red}Check`]}
                                    onChange={handleCheckboxChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <label className="campoMetodo">
                            {red === 'wp' ? 'Numero de Whatsapp:' : 'Link:'}
                            <input
                                type={red === 'email' ? 'email' : red === 'wp' ? 'number' : 'text'}
                                name={`${red}Texto`}
                                placeholder={red === 'wp' ? '59899487555' : red === 'email' ? 'example@example.com' : ''}
                                value={form[`${red}Texto`]}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                ))}
                <button type="submit">Guardar cambios</button>
            </form>

            {message && (
                <p style={{
                    color: messageType === 'success' ? 'green' : 'red',
                    textAlign: 'center'
                }}>
                    {message}
                </p>
            )}

            <div className="volver">
                <a href="/admin">&larr; Volver al inicio</a>
            </div>
        </div>
    );
}