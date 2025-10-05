// src/middlewares/multerMiddleware.js
import multer from 'multer';

// Middleware para leer archivos en memoria (productos y logos)
export const memoryUpload = multer({ storage: multer.memoryStorage() });

// Para productos: sube directamente a Cloudinary
export const productoUpload = memoryUpload;

// Para logos: también sube directamente a Cloudinary
export const logoUpload = memoryUpload;

// Para carga masiva de productos (en memoria)
export const upload = memoryUpload;
