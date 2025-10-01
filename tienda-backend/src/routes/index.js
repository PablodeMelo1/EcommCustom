// src/routes/index.js
import { Router } from 'express';
import authRoutes from './v1/auth.js';
import configRoutes from './v1/config.js';
import productosRoutes from './v1/productos.js';
import carritoRoutes from './v1/carrito.js';
import pedidosRoutes from './v1/pedidos.js';
import categoriasRoutes from './v1/categorias.js';
import mercadopagoRoutes from './v1/mercadopago.js';

const router = Router();

// Agrupa todas las rutas de la versión 1 bajo el prefijo /v1
router.use('/v1/auth', authRoutes);
router.use('/v1/config', configRoutes);
router.use('/v1/productos', productosRoutes);
router.use('/v1/carrito', carritoRoutes);
router.use('/v1/pedidos', pedidosRoutes);
router.use('/v1/categorias', categoriasRoutes);
router.use('/v1/mercadopago', mercadopagoRoutes);

export default router;