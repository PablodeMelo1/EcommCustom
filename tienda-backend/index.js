import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import Config from './models/Config.js';
import Producto from './models/producto.js';
import Usuario from './models/Usuario.js';
import Carrito from './models/Carrito.js';
import Pedido from './models/pedido.js';
import Categoria from './models/Categoria.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import xlsx from 'xlsx';
import path from "path";
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Inicialización de Express y middlewares
const JWT_SECRET = process.env.JWT_SECRET;;
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// **************Configuración de rutas estáticas y Multer********************

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para guardar archivos en public/uploads
const productoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // CORREGIDO: Usamos la ruta completa para guardar en public/uploads
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const productoUpload = multer({ storage: productoStorage });

const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, 'logo' + path.extname(file.originalname)); // Usamos un nombre fijo para el logo
    }
});
const logoUpload = multer({ storage: logoStorage });

// Servir la carpeta /public y /uploads como estática
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

//********************fin Configuración de rutas estáticas y Multer**************************/

// Conexión a MongoDB
mongoose.connect(process.env.DB_URI, { // 👈 Usar variable de entorno
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('Error en MongoDB:', err));

// Middleware de autenticación
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado' });
            }
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}


// Rutas
// GET Config
app.get('/api/config', async (req, res) => {
    const config = await Config.findOne();
    res.json(config);
});

// // OLD OST Config
// app.post('/api/config', async (req, res) => {
//     let config = await Config.findOne();
//     if (!config) {
//         config = new Config(req.body);
//     } else {
//         Object.assign(config, req.body);
//     }
//     await config.save();
//     res.json({
//         message: 'Configuración guardada correctamente',
//         config
//     });
// });

// POST Config
app.post('/api/config', logoUpload.single('logo'), async (req, res) => {
    try {
        let config = await Config.findOne();
        
        // Creamos un objeto de datos a actualizar
        const updateData = {};

        // 🚨 CAMBIO AQUÍ 🚨
        // Solo copiamos las propiedades del body si existen
        for (const key in req.body) {
            updateData[key] = req.body[key];
        }

        if (req.file) {
            updateData.logoUrl = `/uploads/${req.file.filename}`;
        }

        // Solo intenta parsear `transferenciaCuentas` si la propiedad existe y es un string
        if (updateData.transferenciaCuentas && typeof updateData.transferenciaCuentas === 'string') {
            try {
                updateData.transferenciaCuentas = JSON.parse(updateData.transferenciaCuentas);
            } catch (parseError) {
                console.error('Error al parsear transferenciaCuentas:', parseError);
                return res.status(400).json({ error: 'El formato de las cuentas de transferencia es inválido.' });
            }
        }
        
        // Conversión de booleanos
        const booleanFields = [
            'igCheck', 'xCheck', 'fbCheck', 'ttCheck', 'wpCheck', 'emailCheck', 
            'mercadoPagoCheck', 'transferenciaCheck', 'efectivoCheck'
        ];
        booleanFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = updateData[field] === 'true';
            }
        });

        if (!config) {
            config = new Config(updateData);
        } else {
            // ✅ Y CAMBIO AQUÍ TAMBIÉN 
            // Usamos Object.assign para actualizar solo los campos que existen en `updateData`
            Object.assign(config, updateData);
        }

        await config.save();
        res.json({
            message: 'Configuración guardada correctamente',
            config
        });
    } catch (err) {
        console.error('Error al guardar configuración:', err);
        res.status(500).json({ error: 'Error al guardar la configuración' });
    }
});
// GET Productos
app.get('/api/productos', async (req, res) => {
    const productos = await Producto.find();
    res.json(productos);
});

// GET Producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al buscar el producto' });
    }
});

// DELETE Producto
app.delete('/api/productos/:id', async (req, res) => {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// POST Producto
app.post('/api/productos', productoUpload.single('img'), async (req, res) => {
    try {
        const { nombre, precio, stock, descripcion, oferta, descuento, categoria, destacado, colores, talles, coloresCheck, tallesCheck } = req.body;


        if (!nombre || !precio || !stock || !categoria) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const prod = new Producto({
            nombre,
            precio,
            stock,
            descripcion,
            oferta: oferta === 'true' || oferta === true,
            descuento,
            categoria,
            destacado: destacado === 'true' || destacado === true,
            coloresCheck: coloresCheck === 'true' || coloresCheck === true, // 👈 nuevo
            tallesCheck: tallesCheck === 'true' || tallesCheck === true,   // 👈 nuevo
            colores: colores ? (Array.isArray(colores) ? colores : JSON.parse(colores)) : [],
            talles: talles ? (Array.isArray(talles) ? talles : JSON.parse(talles)) : [],
            img: req.file ? `/uploads/${req.file.filename}` : ""
        });

        await prod.save();
        res.json(prod);
    } catch (err) {
        console.error("❌ Error al crear producto:", err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// PUT Producto
app.put('/api/productos/:id', productoUpload.single('img'), async (req, res) => {
    try {
        const { nombre, precio, stock, descripcion, oferta, descuento, categoria, destacado, colores, talles, coloresCheck, tallesCheck } = req.body;


        const updateData = {
            nombre,
            precio,
            stock,
            descripcion,
            oferta: oferta === 'true' || oferta === true,
            descuento,
            categoria,
            destacado: destacado === 'true' || destacado === true,
            coloresCheck: coloresCheck === 'true' || coloresCheck === true, // 👈 nuevo
            tallesCheck: tallesCheck === 'true' || tallesCheck === true,   // 👈 nuevo
            colores: colores ? (Array.isArray(colores) ? colores : JSON.parse(colores)) : [],
            talles: talles ? (Array.isArray(talles) ? talles : JSON.parse(talles)) : []
        };


        if (req.file) {
            updateData.img = `/uploads/${req.file.filename}`;
        }

        const prod = await Producto.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(prod);
    } catch (err) {
        console.error("❌ Error al actualizar producto:", err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});


const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/productos/carga-masiva', upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No se ha subido ningún archivo' });
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const productosData = xlsx.utils.sheet_to_json(sheet);
        const productosParaGuardar = [];
        const errores = [];
        for (let i = 0; i < productosData.length; i++) {
            const data = productosData[i];
            const fila = i + 2;
            if (!data.nombre || !data.precio || !data.stock) {
                errores.push(`Error en la fila ${fila}: Faltan campos obligatorios (nombre, precio, stock).`);
                continue;
            }
            const precio = parseFloat(data.precio);
            const stock = parseInt(data.stock, 10);
            if (isNaN(precio) || isNaN(stock) || precio < 0 || stock < 0) {
                errores.push(`Error en la fila ${fila}: Los campos 'precio' y 'stock' deben ser números válidos y positivos.`);
                continue;
            }
            let categoriaId = null;
            if (data.categoria) {
                const categoria = await Categoria.findOne({ nombre: data.categoria.trim() });
                if (!categoria) {
                    errores.push(`Error en la fila ${fila}: La categoría "${data.categoria}" no existe.`);
                    continue;
                }
                categoriaId = categoria._id;
            }
            const nuevoProducto = {
                nombre: data.nombre,
                precio: precio,
                stock: stock,
                descripcion: data.descripcion || '',
                img: data.img || '',
                oferta: data.oferta === 'sí' || data.oferta === 'si' || data.oferta === 'true',
                descuento: parseInt(data.descuento) || 0,
                categoria: categoriaId,
            };
            productosParaGuardar.push(nuevoProducto);
        }
        if (errores.length > 0) {
            return res.status(400).json({
                msg: 'Errores en el archivo, no se cargó ningún producto.',
                errores
            });
        }
        await Producto.insertMany(productosParaGuardar);
        res.status(200).json({
            msg: `Se han creado ${productosParaGuardar.length} productos correctamente.`
        });
    } catch (err) {
        console.error('Error en la carga masiva:', err);
        res.status(500).json({ msg: 'Error interno del servidor al procesar el archivo.' });
    }
});


// Rutas de autenticación, registro, comentarios, carrito y pedidos
app.post('/api/login', async (req, res) => {
    const { mail, contra } = req.body;
    const usuario = await Usuario.findOne({ mail });
    if (!usuario || usuario.contra !== contra) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const payload = { id: usuario._id, role: usuario.role, mail: usuario.mail };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '3m' });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.json({ accessToken, usuario: { _id: usuario._id, nombre: usuario.nombre, role: usuario.role } });
});

app.post('/api/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No se encontró el refresh token.' });
    }
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const usuario = await Usuario.findById(decoded.id);
        if (!usuario) {
            return res.status(403).json({ error: 'Usuario no encontrado.' });
        }
        const payload = { id: usuario._id, role: usuario.role, mail: usuario.mail };
        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '3m' });
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ error: 'El refresh token es inválido o ha expirado.' });
    }
});

app.post('/api/registro', async (req, res) => {
    const { mail, nombre, telefono, contra } = req.body;
    const existingUser = await Usuario.findOne({ mail });
    if (existingUser) return res.status(400).json({ error: 'Usuario ya existe' });
    const newUser = new Usuario({ mail, nombre, telefono, contra });
    await newUser.save();
    res.json({ message: 'Usuario registrado correctamente' });
});

app.post('/api/productos/:id/comentarios', async (req, res) => {
    const { nombre, mensaje, puntuacion } = req.body;
    if (!nombre || !mensaje || !puntuacion) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const comentario = { nombre, mensaje, puntuacion };
    try {
        const producto = await Producto.findById(req.params.id);
        producto.comentarios.push(comentario);
        await producto.save();
        res.status(200).json({ mensaje: 'Comentario guardado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'No se pudo guardar el comentario' });
    }
});

app.get('/api/productos/:id/comentarios', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(200).json(producto.comentarios || []);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener comentarios' });
    }
});

// Obtener carrito de un usuario
app.get('/api/carrito/:userId', async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ userId: req.params.userId });
        res.json(carrito || { userId: req.params.userId, items: [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});

// Crear o actualizar carrito
app.put('/api/carrito/:userId', async (req, res) => {
    try {
        const { items } = req.body;

        // Validar que cada item tenga los campos necesarios
        const itemsValidados = items.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image || 'https://via.placeholder.com/500',
            quantity: i.quantity || 1,
            color: i.color || null,
            talle: i.talle || null
        }));

        let carrito = await Carrito.findOne({ userId: req.params.userId });

        if (carrito) {
            carrito.items = itemsValidados;
        } else {
            carrito = new Carrito({ userId: req.params.userId, items: itemsValidados });
        }

        await carrito.save();
        res.status(200).json(carrito);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar el carrito' });
    }
});

// Eliminar carrito
app.delete('/api/carrito/:userId', async (req, res) => {
    try {
        await Carrito.findOneAndDelete({ userId: req.params.userId });
        res.status(200).json({ mensaje: 'Carrito eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el carrito' });
    }
});


app.post('/api/pedidos', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            items, total, direccion, numeroCasa, tipoCasa, ciudad,
            departamento, pais, infoAdicional, paymentMethod, tipoEntrega
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }
        for (const item of items) {
            const producto = await Producto.findById(item.productId);
            if (!producto) {
                return res.status(404).json({ error: `Producto con ID ${item.productId} no encontrado` });
            }
            if (producto.stock < item.quantity) {
                return res.status(400).json({ error: `No hay suficiente stock para ${item.name}, stock restante: ${producto.stock}` });
            }
        }
        
        let estadoPedido = "pendiente";
        if (paymentMethod === "mercado_pago") {
            estadoPedido = "pago";
        }
        const nuevoPedido = new Pedido({
            numeroPedido: nanoid(8),
            userId,
            items, total, direccion, numeroCasa, tipoCasa, ciudad,
            departamento, pais, infoAdicional, paymentMethod, tipoEntrega,
            estado: estadoPedido,
            fecha: new Date()
        });

        if (paymentMethod !== "mercado_pago") {
            for (const item of items) {
                await Producto.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: -item.quantity } }
                );
            }
        }

        await nuevoPedido.save();
        await Carrito.findOneAndDelete({ userId });
        res.status(201).json({ mensaje: 'Pedido creado con éxito', pedido: nuevoPedido });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
});

app.get('/api/pedidos', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        const pedidos = await Pedido.find().populate('userId', 'nombre mail nroTelefono').sort({ fecha: -1 });
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

app.put('/api/pedidos/:id/estado', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const pedido = await Pedido.findByIdAndUpdate(id, { estado }, { new: true });
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(pedido);
    } catch (err) {
        console.error('Error al actualizar estado:', err);
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
});

app.get('/api/pedidos/cliente', authMiddleware, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ userId: req.user.id }).sort({ fecha: -1 });
        res.json(pedidos);
    } catch (err) {
        console.error('Error al obtener pedidos del cliente:', err);
        res.status(500).json({ error: 'No se pudieron obtener los pedidos' });
    }
});

app.get('/api/pedidos/:id', authMiddleware, async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const pedido = await Pedido.findById(pedidoId);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(pedido);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error al obtener el pedido' });
    }
});

app.get('/api/categorias', async (req, res) => {
    const categorias = await Categoria.find();
    res.json(categorias);
});

app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre } = req.body; // Extrae el nombre del cuerpo de la solicitud

        // 1. Busca si ya existe una categoría con el mismo nombre
        const categoriaExistente = await Categoria.findOne({ nombre });

        // 2. Si ya existe, devuelve un error 409
        if (categoriaExistente) {
            return res.status(409).json({ error: 'Ya existe una categoría con este nombre.' });
        }

        // 3. Si no existe, crea y guarda la nueva categoría
        const nueva = new Categoria({ nombre });
        await nueva.save();
        
        // 4. Responde con la nueva categoría creada
        res.status(201).json(nueva);
    } catch (err) {
        // En caso de cualquier otro error (problema de conexión, etc.)
        res.status(500).json({ error: 'Error del servidor. Inténtalo de nuevo.' });
    }
});

app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria.findByIdAndDelete(id);

        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ msg: 'Categoría eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Endpoint para crear la preferencia de pago
app.post('/api/crear-preferencia', authMiddleware, async (req, res) => {
    try {
        const { items, total, descripcion, direccionEnvio, tipoEntrega } = req.body;
        const userId = req.user.id;

        const nuevoPedido = new Pedido({
            numeroPedido: nanoid(8),
            userId,
            items,
            total,
            direccion: direccionEnvio,
            tipoEntrega,
            paymentMethod: 'mercado_pago',
            estado: 'pendiente',
            fecha: new Date()
        });
        await nuevoPedido.save();
        console.log("✅ Pedido inicial creado con ID:", nuevoPedido._id);

        const config = await Config.findOne();
        if (!config || !config.accessTokenMP) {
            return res.status(400).json({ error: 'Falta el token de Mercado Pago del administrador.' });
        }

        const mp = new MercadoPagoConfig({ accessToken: config.accessTokenMP });
        const preferenceData = {
            items: items.map(item => ({
                title: item.name,
                unit_price: Number(item.price),
                quantity: Number(item.quantity),
                currency_id: 'UYU'
            })),
            back_urls: {
                success: `${process.env.FRONTEND_URL}/checkoutExito?pedidoId=${nuevoPedido._id}`,
                failure: `${process.env.FRONTEND_URL}/checkoutExito?pedidoId=${nuevoPedido._id}`,
                pending: `${process.env.FRONTEND_URL}/checkoutExito?pedidoId=${nuevoPedido._id}`
            },
            notification_url: 'https://ceb749162e00.ngrok-free.app',
            metadata: {
                userId: req.user.id,
                pedidoId: nuevoPedido._id.toString()
            }
        };

        const client = new Preference(mp);
        const result = await client.create({ body: preferenceData });
        res.json({ init_point: result.init_point, pedidoId: nuevoPedido._id });

    } catch (err) {
        console.error('Error creando preferencia:', err);
        res.status(500).json({ error: 'No se pudo generar el pago' });
    }
});

// Endpoint para recibir las notificaciones de Mercado Pago (Webhook)
app.post('/api/mercadopago-webhook', async (req, res) => {
    console.log("🔔 Webhook de Mercado Pago recibido");
    console.log(req.body);

    const topic = req.body.topic || req.body.type;
    const paymentId = req.body.data?.id;

    if (topic === 'payment' && paymentId) {
        try {
            const config = await Config.findOne();
            if (!config || !config.accessTokenMP) {
                return res.status(400).send('Falta el token de Mercado Pago del administrador.');
            }

            const mp = new MercadoPagoConfig({ accessToken: config.accessTokenMP });
            const paymentClient = new Payment(mp);
            const payment = await paymentClient.get({ id: paymentId });
            console.log("Detalles del pago:", payment);
            const pedidoId = payment.metadata.pedido_id;
            const paymentStatus = payment.status;

            console.log("Pedido ID: ", pedidoId);
            if (pedidoId) {
                const pedido = await Pedido.findById(pedidoId);
                if (pedido) {
                    switch (paymentStatus) {
                        case 'approved':
                            if (pedido.estado !== 'pago') {
                                for (const item of pedido.items) {
                                    await Producto.updateOne(
                                        { _id: item.productId },
                                        { $inc: { stock: -item.quantity } }
                                    );
                                }
                                pedido.estado = 'pago';
                                pedido.paymentIdMP = paymentId;
                            }
                            break;
                        case 'rejected':
                            pedido.estado = 'fallido';
                            break;
                        case 'in_process':
                            pedido.estado = 'en_proceso';
                            break;
                        default:
                            console.log(`Estado de pago no manejado: ${paymentStatus}`);
                            break;
                    }
                    await pedido.save();
                    console.log(`✅ Pedido ${pedidoId} actualizado a "${pedido.estado}"`);
                }
            }
            res.status(200).send('OK');
        } catch (err) {
            console.error('Error al procesar webhook:', err);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('OK');
    }
});

app.listen(process.env.PORT || 3001, () => {
    console.log(`✅ API corriendo en ${process.env.NODE_ENV === 'production' ? 'tu-dominio.com' : 'http://localhost'}:${process.env.PORT || 3001}`);
});