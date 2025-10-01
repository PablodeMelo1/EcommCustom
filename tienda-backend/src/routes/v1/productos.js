// src/routes/v1/productos.js
import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, bulkUploadProducts, addCommentToProduct, getCommentsOfProduct, deleteCommentFromProduct} from '../../controllers/productoController.js';
import { productoUpload, upload } from '../../middlewares/multerMiddleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', productoUpload.single('img'), createProduct);
router.put('/:id', productoUpload.single('img'), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/carga-masiva', upload.single('archivo'), bulkUploadProducts);
router.post('/:id/comentarios', addCommentToProduct);
router.get('/:id/comentarios', getCommentsOfProduct);
router.delete('/:id/comentarios/:commentId', deleteCommentFromProduct);

export default router;