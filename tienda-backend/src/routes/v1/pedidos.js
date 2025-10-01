// src/routes/v1/pedidos.js
import { Router } from 'express';
import { createPedido, getPedidos, getPedidosCliente, getPedidoById, updatePedidoEstado } from '../../controllers/pedidoController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, createPedido);
router.get('/', authMiddleware, getPedidos); // Admin
router.get('/cliente', authMiddleware, getPedidosCliente);
router.get('/:id', authMiddleware, getPedidoById);
router.put('/:id/estado', authMiddleware, updatePedidoEstado); // Admin

export default router;