// src/controllers/productoController.js
import * as productoService from '../services/productoService.js';
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from 'uuid';
import { logError } from '../utils/logger.js';
import streamifier from "streamifier";

export const getProducts = async (req, res) => {
    try {
        const productos = await productoService.getAllProducts();
        res.json(productos);
    } catch (error) {
        logError('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const producto = await productoService.getProductById(req.params.id);
        res.json(producto);
    } catch (error) {
        logError('Error al obtener producto por ID:', error);
        res.status(404).json({ error: 'Producto no encontrado' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { body, file } = req;

        let imgUrl = "";
        let imgPublic = "";

        if (file) {
            imgPublic = `productos/${uuidv4()}`;

            imgUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { public_id: imgPublic, overwrite: true },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
        }

        const updateData = {
            ...body,
            img: imgUrl,
            imgPublicId: imgPublic,
            colores: body.colores ? JSON.parse(body.colores) : [],
            talles: body.talles ? JSON.parse(body.talles) : [],
            oferta: body.oferta === 'true' || body.oferta === true,
            destacado: body.destacado === 'true' || body.destacado === true,
            coloresCheck: body.coloresCheck === 'true' || body.coloresCheck === true,
            tallesCheck: body.tallesCheck === 'true' || body.tallesCheck === true
        };

        const newProduct = await productoService.createProduct(updateData);
        res.status(201).json(newProduct);

    } catch (error) {
        logError('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        // 1️⃣ Obtener el producto antes de eliminarlo
        const producto = await productoService.getProductById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // 2️⃣ Borrar la imagen de Cloudinary si existe
        if (producto.imgPublicId) {
            await cloudinary.uploader.destroy(producto.imgPublicId);
        }

        // 3️⃣ Eliminar el producto de la DB
        await productoService.deleteProduct(req.params.id);

        res.json({ success: true, message: 'Producto eliminado correctamente' });

    } catch (error) {
        logError('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { body, file } = req;

        let imgUrl = "";
        let imgPublic = body.imgPublicId || ""; // mantener el mismo si no cambia

        // 🔹 Si viene una nueva imagen, la subimos a Cloudinary
        if (file) {
            imgPublic = `productos/${uuidv4()}`; // nuevo ID si reemplaza imagen

            imgUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { public_id: imgPublic, overwrite: true },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
        }

        const updateData = {
            ...body,
            img: file ? imgUrl : body.img,   // si no se subió nueva, queda igual
            imgPublicId: imgPublic,
            colores: body.colores ? JSON.parse(body.colores) : [],
            talles: body.talles ? JSON.parse(body.talles) : [],
            oferta: body.oferta === 'true' || body.oferta === true,
            destacado: body.destacado === 'true' || body.destacado === true,
            coloresCheck: body.coloresCheck === 'true' || body.coloresCheck === true,
            tallesCheck: body.tallesCheck === 'true' || body.tallesCheck === true
        };

        const updatedProduct = await productoService.updateProduct(req.params.id, updateData);
        res.json(updatedProduct);
    } catch (error) {
        logError('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};




export const deleteCommentFromProduct = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        if (!id || !commentId) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });
        }
        await productoService.deleteProductComment(id, commentId);
        res.status(200).json({ mensaje: 'Comentario eliminado' });
    } catch (error) {
        logError('Error al eliminar comentario:', error);
        res.status(500).json({ error: 'No se pudo eliminar el comentario' });
    }
};

export const bulkUploadProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No se ha subido ningún archivo' });
        }
        const { productosCreados, errores } = await productoService.bulkUploadProducts(req.file.buffer);
        res.status(200).json({
            msg: `Se han creado ${productosCreados} productos correctamente.`,
            errores
        });
    } catch (error) {
        logError('Error en la carga masiva:', error);
        try {
            const erroresDetallados = JSON.parse(error.message);
            res.status(400).json({
                msg: 'Errores en el archivo, no se cargó ningún producto.',
                errores: erroresDetallados
            });
        } catch (parseError) {
            res.status(500).json({ msg: 'Error interno del servidor al procesar el archivo.' });
        }
    }
};

export const addCommentToProduct = async (req, res) => {
    try {
        const { nombre, mensaje, puntuacion } = req.body;
        if (!nombre || !mensaje || !puntuacion) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }
        await productoService.addProductComment(req.params.id, req.body);
        res.status(200).json({ mensaje: 'Comentario guardado' });
    } catch (error) {
        logError('Error al guardar comentario:', error);
        res.status(500).json({ error: 'No se pudo guardar el comentario' });
    }
};

export const getCommentsOfProduct = async (req, res) => {
    try {
        const comentarios = await productoService.getProductComments(req.params.id);
        res.status(200).json(comentarios);
    } catch (error) {
        logError('Error al obtener comentarios:', error);
        res.status(404).json({ error: 'Producto no encontrado' });
    }
};
