import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../../api';
import '../../styles/productos.css';

export const BASE_URL = process.env.REACT_APP_BASE_URL_API;

export default function ProductosAdmin() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        precio: '',
        stock: '',
        descripcion: '',
        oferta: false,
        descuento: 0,
        categoria: '',
        destacado: false,
        coloresCheck: false,
        colores: [],
        tallesCheck: false,
        talles: []
    });

    const [imagenFile, setImagenFile] = useState(null);
    const [editId, setEditId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [filtros, setFiltros] = useState({ nombre: '', precioMin: '', precioMax: '' });
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadMessageType, setUploadMessageType] = useState('');
    const [erroresCarga, setErroresCarga] = useState([]);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') navigate('/');
        cargarProductos();
        cargarCategorias();
    }, [navigate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    async function cargarProductos() {
        try {
            const res = await fetchWithRefresh('/api/v1/productos');
            if (!res.ok) throw new Error('Error al cargar productos');
            const data = await res.json();
            setProductos(data);
        } catch (err) {
            setMessageType('error');
            setMessage('Error al cargar productos: ' + err.message);
        }
    }

    async function cargarCategorias() {
        try {
            const res = await fetchWithRefresh('/api/v1/categorias');
            if (!res.ok) throw new Error('Error al cargar categorías');
            const data = await res.json();
            setCategorias(data);
        } catch (err) {
            setMessageType('error');
            setMessage('Error al cargar categorías: ' + err.message);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    }

    function handleFileChangeProducto(e) {
        setImagenFile(e.target.files[0]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const metodo = editId ? 'PUT' : 'POST';
        const url = editId ? `/api/v1/productos/${editId}` : '/api/v1/productos';

        try {
            const formData = new FormData();

            Object.keys(form).forEach(key => {
                if (key === 'colores' || key === 'talles') {
                    formData.append(key, JSON.stringify(form[key])); // 👈 importante: JSON.stringify
                } else {
                    formData.append(key, form[key]);
                }
            });

            if (imagenFile) {
                formData.append('img', imagenFile);
            }

            const res = await fetchWithRefresh(url, {
                method: metodo,
                body: formData,
            });

            if (!res.ok) throw new Error('Error al guardar el producto');

            // Reset
            setForm({
                nombre: '',
                precio: '',
                stock: '',
                descripcion: '',
                oferta: false,
                descuento: 0,
                categoria: '',
                destacado: false,
                coloresCheck: false,
                colores: [],
                tallesCheck: false,
                talles: []
            });
            setImagenFile(null);
            setEditId(null);
            await cargarProductos();
            setMessageType('success');
            setMessage(editId ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        } catch (err) {
            setMessageType('error');
            setMessage('Error: ' + err.message);
        }
    }


    function handleEditar(prod) {
        setForm({
            ...form,
            nombre: prod.nombre,
            precio: prod.precio,
            stock: prod.stock || 0,
            descripcion: prod.descripcion,
            oferta: prod.oferta || false,
            descuento: prod.descuento || 0,
            categoria: prod.categoria || '',
            destacado: prod.destacado || false,
            coloresCheck: prod.coloresCheck || false,
            colores: prod.colores || [],
            tallesCheck: prod.tallesCheck || false,
            talles: prod.talles || []
        });
        setImagenFile(null);
        setEditId(prod._id);
    }

    function handleConfirmarEliminar(id) {
        setConfirmDeleteId(id);
    }

    async function handleEliminar(id) {
        try {
            const res = await fetchWithRefresh(`/api/v1/productos/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar el producto');
            await cargarProductos();
            setMessageType('success');
            setMessage('Producto eliminado correctamente');
        } catch (err) {
            setMessageType('error');
            setMessage('Error al eliminar: ' + err.message);
        } finally {
            setConfirmDeleteId(null);
        }
    }

    function cancelarEdicion() {
        setForm({
            nombre: '',
            precio: '',
            stock: '',
            descripcion: '',
            oferta: false,
            descuento: 0,
            categoria: '',
            destacado: false,
            coloresCheck: false,
            colores: [],
            tallesCheck: false,
            talles: []
        });
        setImagenFile(null);
        setEditId(null);
    }

    async function handleCrearCategoria(e) {
        e.preventDefault();
        const nombre = nuevaCategoria.trim();
        if (!nombre) {
            setMessageType('error');
            setMessage('El nombre de la categoría no puede estar vacío');
            return;
        }

        try {
            const res = await fetchWithRefresh('/api/v1/categorias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            setNuevaCategoria('');
            await cargarCategorias();
            setMessageType('success');
            setMessage('Categoría creada correctamente');

        } catch (err) {
            setMessageType('error');
            setMessage(err.message);
        }
    }

    const productosFiltrados = productos.filter(prod => {
        const nombreCoincide = prod.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
        const precio = parseFloat(prod.precio);
        const precioMinOk = filtros.precioMin === '' || precio >= parseFloat(filtros.precioMin);
        const precioMaxOk = filtros.precioMax === '' || precio <= parseFloat(filtros.precioMax);
        return nombreCoincide && precioMinOk && precioMaxOk;
    });

    function handleFileChange(e) {
        setSelectedFile(e.target.files[0]);
        setUploadMessage('');
        setErroresCarga([]);
    }

    async function handleCargaMasiva(e) {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('archivo', selectedFile);

        try {
            const res = await fetchWithRefresh('/api/v1/productos/carga-masiva', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setUploadMessageType('error');
                setUploadMessage(data.msg);
                setErroresCarga(data.errores || []);
                throw new Error(data.msg);
            }

            setUploadMessageType('success');
            setUploadMessage(data.msg);
            setSelectedFile(null);
            await cargarProductos();
        } catch (err) {
            console.error(err);
        }
    }

    function handleConfirmarEliminarCategoria(id) {
        setConfirmDeleteId(id);
    }

    async function handleEliminarCategoria(id) {
        try {
            const res = await fetchWithRefresh(`/api/v1/categorias/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar la categoría');
            await cargarCategorias();
            setMessageType('success');
            setMessage('Categoría eliminada correctamente');
        } catch (err) {
            setMessageType('error');
            setMessage('Error al eliminar: ' + err.message);
        } finally {
            setConfirmDeleteId(null);
        }
    }

    return (
        <div className="productos-container">
            <h2>Administrar productos</h2>
            {/* Formulario de creación/edición */}
            <form onSubmit={handleSubmit} id='formulario' className="product-form" encType="multipart/form-data">
                <div className="form-group-inline">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="precio">Precio</label>
                        <input type="number" id="precio" name="precio" value={form.precio} onChange={handleChange} required min="0" step="0.01" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stock">Stock</label>
                        <input type="number" id="stock" name="stock" value={form.stock} onChange={handleChange} required min="0" />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="img">Imagen del producto</label>
                    <p style={{ fontSize: '12px', color: '#666' }}>TIP: Imagen cuadrada con fondo blanco.</p>
                    <input type="file" id="img" name="img" onChange={handleFileChangeProducto} accept="image/*" />
                </div>

                <div className="form-group">
                    <div className="form-group">
                        <label htmlFor="categoria">Categoría</label>
                        <select id="categoria" name="categoria" value={form.categoria} onChange={handleChange} required>
                            <option value="">Seleccionar</option>
                            {categorias.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group-inline">
                    <div className="form-group form-check">
                        <label htmlFor="oferta">
                            <input type="checkbox" id="oferta" name="oferta" checked={form.oferta} onChange={handleChange} />
                            En oferta
                        </label>
                    </div>
                    {form.oferta && (
                        <div className="form-group">
                            <label htmlFor="descuento">Descuento (%)</label>
                            <input
                                type="number"
                                id="descuento"
                                name="descuento"
                                value={form.descuento}
                                onChange={handleChange}
                                min="1"
                                max="100"
                            />
                        </div>
                    )}
                </div>

                <div className="form-group form-check">
                        <label>
                            <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} />
                            Destacado ⭐
                        </label>
                    </div>

                    <div className="form-group form-check">
                    <label>
                        <input
                            type="checkbox"
                            name="coloresCheck"
                            checked={form.coloresCheck}
                            onChange={e => setForm({ ...form, coloresCheck: e.target.checked })}
                        />
                        Usar colores
                    </label>
                </div>
                {form.coloresCheck && (
                    <div className="chip-input">
                        <input
                            type="text"
                            placeholder="Agregar color y Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (e.target.value.trim()) {
                                        setForm({ ...form, colores: [...form.colores, e.target.value.trim()] });
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                        <div className="chips">
                            {form.colores.map((color, idx) => (
                                <span key={idx} className="chip">
                                    {color} <button type="button" onClick={() => setForm({ ...form, colores: form.colores.filter((_, i) => i !== idx) })}>✖</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="form-group form-check">
                    <label>
                        <input
                            type="checkbox"
                            name="tallesCheck"
                            checked={form.tallesCheck}
                            onChange={e => setForm({ ...form, tallesCheck: e.target.checked })}
                        />
                        Usar talles
                    </label>
                </div>
                {form.tallesCheck && (
                    <div className="chip-input">
                        <input
                            type="text"
                            placeholder="Agregar talle y Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (e.target.value.trim()) {
                                        setForm({ ...form, talles: [...form.talles, e.target.value.trim()] });
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                        <div className="chips">
                            {form.talles.map((talle, idx) => (
                                <span key={idx} className="chip">
                                    {talle} <button type="button" onClick={() => setForm({ ...form, talles: form.talles.filter((_, i) => i !== idx) })}>✖</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="form-buttons">
                    <button type="submit" className="btn-primary">{editId ? 'Actualizar producto' : 'Crear producto'}</button>
                    {editId && (
                        <button type="button" onClick={cancelarEdicion} className="btn-primary">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            {/* Formulario de agregar categoría */}
            

            <div className="categorias-container">
                <button className="categorias-toggle" onClick={() => setOpen(!open)}>
                    Categorías <span className="flecha">{open ? "▲" : "▼"}</span>
                </button>

                {open && (
                    <>
                    <div className="add-categories">
                        <h3>Agregar nueva categoría</h3>
                        <form onSubmit={handleCrearCategoria}>
                            <input type="text" placeholder="Nombre de categoría" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} required />
                            <button type="submit" className="btn-primary">Crear</button>
                        </form>
                    </div>
                    <div className="categorias-lista">
                        {categorias.map((cat) => (
                            <div key={cat._id} className="chip">
                                <span>{cat.nombre}</span>
                                {confirmDeleteId === cat._id ? (
                                    <div className="chip-actions">
                                        <button
                                            onClick={() => handleEliminarCategoria(cat._id)}
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
                                        onClick={() => handleConfirmarEliminarCategoria(cat._id)}
                                        className="btn-delete"
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>





            {message && (
                <p className={`message ${messageType}`}>{message}</p>
            )}

            {/* Filtros */}
            <div className="filtros">
                <input
                    type="text"
                    placeholder="Buscar por nombre"
                    value={filtros.nombre}
                    onChange={e => setFiltros({ ...filtros, nombre: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filtros.precioMin}
                    onChange={e => setFiltros({ ...filtros, precioMin: e.target.value })}
                    min="0"
                />
                <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filtros.precioMax}
                    onChange={e => setFiltros({ ...filtros, precioMax: e.target.value })}
                    min="0"
                />
            </div>

            {/* Tabla de productos */}
            {productosFiltrados.length > 0 ? (
                <div className="productos-table-container">
                    <table className="productos-table">
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosFiltrados.map(prod => (
                                <tr key={prod._id}>
                                    <td data-label="Imagen">
                                        {prod.img && <img src={`${BASE_URL}${prod.img}`} alt={prod.nombre} className="table-img" />}
                                    </td>
                                    <td data-label="Nombre">{prod.nombre}</td>
                                    <td data-label="Precio">
                                        {prod.oferta ? (
                                            <>
                                                <span className="precio-viejo">${prod.precio.toFixed(2)}</span>
                                                <span className="precio-nuevo">${(prod.precio * (1 - prod.descuento / 100)).toFixed(2)}</span>
                                            </>
                                        ) : (
                                            <span>${prod.precio.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td data-label="Stock">{prod.stock}</td>
                                    <td data-label="Acciones">
                                        <div className="table-actions">
                                            {confirmDeleteId === prod._id ? (
                                                <>
                                                    <button onClick={() => handleEliminar(prod._id)} className="btn-confirm-delete">✔</button>
                                                    <button onClick={() => setConfirmDeleteId(null)} className="btn-cancel-delete">X</button>
                                                </>
                                            ) : (
                                                <>
                                                    <a href="#formulario"><button onClick={() => handleEditar(prod)} className="btn-primary">Editar</button></a>
                                                    <button onClick={() => handleConfirmarEliminar(prod._id)} className="btn-delete">Eliminar</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="no-productos">No hay productos disponibles.</p>
            )}
            <br />
            {/* Formulario de carga masiva */}
            <div className="carga-masiva-container">
                <h3>Carga masiva de productos</h3>
                <p>Sube un archivo Excel (.xlsx) o CSV con el siguiente formato de columnas: **nombre, precio, stock, descripcion, img, oferta, descuento, categoria**.</p>
                <form onSubmit={handleCargaMasiva} className="carga-masiva-form">
                    <input type="file" onChange={handleFileChange} required accept=".xlsx, .xls, .csv" />
                    <br />
                    <button type="submit" className="btn-primary" disabled={!selectedFile}>Cargar</button>
                </form>
                {uploadMessage && (
                    <p className={`message ${uploadMessageType}`}>{uploadMessage}</p>
                )}
                {erroresCarga.length > 0 && (
                    <div className="errores-carga">
                        <h4>Errores en la carga:</h4>
                        <ul>
                            {erroresCarga.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="volver">
                <a href="/admin">&larr; Volver</a>
            </div>
        </div>
    );
}