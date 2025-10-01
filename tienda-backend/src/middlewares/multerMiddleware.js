// src/middlewares/multerMiddleware.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración para subir archivos a la carpeta 'public/uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Configuración específica para productos (una imagen por producto)
export const productoUpload = multer({ storage: storage });

// Configuración específica para el logo (nombre fijo 'logo')
export const logoUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../../public/uploads'));
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, 'logo' + ext); // Nombre fijo para el logo
        }
    })
});

// Configuración para la carga masiva de archivos (en memoria)
export const upload = multer({ storage: multer.memoryStorage() });