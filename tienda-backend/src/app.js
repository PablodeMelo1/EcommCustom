// src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { logSuccess, logError } from './utils/logger.js';
import mainRouter from './routes/index.js';
import { v2 as cloudinary } from 'cloudinary';

// Inicialización de Express
const app = express();

// Middlewares globales
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Conexión a MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => logSuccess('Conectado a MongoDB'))
.catch(err => logError('Error en MongoDB:', err));

// Configuración de Cloudinary directamente
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_SECRET,
});

// Configuración de rutas estáticas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carpeta pública y uploads locales (temporal)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rutas de la API (v1)
app.use('/api', mainRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    logSuccess(`API corriendo en el puerto ${PORT}`);
});
