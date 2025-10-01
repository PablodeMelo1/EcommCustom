// src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import mongoose from 'mongoose';
import path from "path";
import { fileURLToPath } from 'url';
import { logSuccess, logError } from './utils/logger.js';
import mainRouter from './routes/index.js';

// Inicialización de Express
const app = express();

// Middlewares globales
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Conexión a MongoDB
mongoose.connect(process.env.DB_URI)
.then(() => logSuccess('Conectado a MongoDB'))
.catch(err => logError('Error en MongoDB:', err));

// Configuración de rutas estáticas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rutas de la API (versión 1)
app.use('/api', mainRouter);

// Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    logSuccess(`API corriendo en el puerto ${PORT}`);
});