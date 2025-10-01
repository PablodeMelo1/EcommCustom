// src/routes/v1/carrito.js
import { Router } from 'express';
import { getCarrito, saveCarrito, updateCarrito ,deleteCarrito } from '../../controllers/carritoController.js';

const router = Router();

router.get('/:userId', getCarrito);
router.post('/:userId', saveCarrito);
router.put('/:userId', updateCarrito);
router.delete('/:userId', deleteCarrito);

export default router;