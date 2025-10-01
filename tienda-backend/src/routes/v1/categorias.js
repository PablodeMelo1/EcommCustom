// src/routes/v1/categorias.js
import { Router } from 'express';
import { getCategorias, createCategoria, deleteCategoria } from '../../controllers/categoriaController.js';

const router = Router();

router.get('/', getCategorias);
router.post('/', createCategoria);
router.delete('/:id', deleteCategoria);

export default router;