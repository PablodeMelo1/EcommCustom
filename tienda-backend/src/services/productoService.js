
// src/services/productoService.js
import Producto from '../models/Producto.js';
import { validateAndFormatProduct } from '../utils/helpers.js';
import xlsx from 'xlsx';
import mongoose from 'mongoose';

/**
 * Obtiene todos los productos.
 * @returns {Promise<Array>}
 */
export const getAllProducts = async () => {
    return await Producto.find();
};

/**
 * Obtiene un producto por su ID.
 * @param {string} id - El ID del producto.
 * @returns {Promise<object>}
 */
export const getProductById = async (id) => {
    const producto = await Producto.findById(id);
    if (!producto) {
        throw new Error('Producto no encontrado');
    }
    return producto;
};

/**
 * Crea un nuevo producto.
 * @param {object} productData - Los datos del producto a crear.
 * @returns {Promise<object>}
 */
export const createProduct = async (productData) => {
    const prod = new Producto(productData);
    await prod.save();
    return prod;
};

/**
 * Actualiza un producto existente.
 * @param {string} id - El ID del producto a actualizar.
 * @param {object} updateData - Los datos para actualizar el producto.
 * @returns {Promise<object>}
 */
export const updateProduct = async (id, updateData) => {
    const prod = await Producto.findByIdAndUpdate(id, updateData, { new: true });
    return prod;
};

/**
 * Elimina un producto.
 * @param {string} id - El ID del producto a eliminar.
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
    await Producto.findByIdAndDelete(id);
};

/**
 * Realiza la carga masiva de productos desde un archivo de Excel.
 * @param {Buffer} fileBuffer - El buffer del archivo de Excel.
 * @returns {Promise<{productosCreados: number, errores: string[]}>}
 */
export const bulkUploadProducts = async (fileBuffer) => {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const productosData = xlsx.utils.sheet_to_json(sheet);

    const productosParaGuardar = [];
    const errores = [];

    for (let i = 0; i < productosData.length; i++) {
        const data = productosData[i];
        const rowNumber = i + 2; // +2 porque el índice del array es 0 y la primera fila es de encabezados
        const { producto, errores: filaErrores } = await validateAndFormatProduct(data, rowNumber);

        if (filaErrores.length > 0) {
            errores.push(...filaErrores);
        } else {
            productosParaGuardar.push(producto);
        }
    }

    if (errores.length > 0) {
        throw new Error(JSON.stringify(errores));
    }

    await Producto.insertMany(productosParaGuardar);
    return { productosCreados: productosParaGuardar.length, errores: [] };
};

/**
 * Agrega un comentario a un producto.
 * @param {string} productId - El ID del producto.
 * @param {object} commentData - Los datos del comentario (nombre, mensaje, puntuacion).
 * @returns {Promise<object>} El producto actualizado con el nuevo comentario.
 */
export const addProductComment = async (productId, commentData) => {
    const producto = await Producto.findById(productId);
    if (!producto) {
        throw new Error('Producto no encontrado');
    }
    producto.comentarios.push(commentData);
    await producto.save();
    return producto;
};

/**
 * Obtiene todos los comentarios de un producto.
 * @param {string} productId - El ID del producto.
 * @returns {Promise<Array>}
 */
export const getProductComments = async (productId) => {
    const producto = await Producto.findById(productId);
    if (!producto) {
        throw new Error('Producto no encontrado');
    }
    return producto.comentarios || [];
};


/**
 * Elimina un comentario de un producto.
 * @param {string} productId - El ID del producto.
 * @param {string} commentId - El ID del comentario a eliminar.
 * @returns {Promise<object>} El producto actualizado sin el comentario.
 */
export const deleteProductComment = async (productId, commentId) => {
    const producto = await Producto.findById(productId);
    if (!producto) {
        throw new Error("Producto no encontrado");
    }

    const comentariosOriginales = producto.comentarios.length;

    producto.comentarios = producto.comentarios.filter(
        (comentario) => !comentario._id.equals(new mongoose.Types.ObjectId(commentId))
    );

    if (producto.comentarios.length === comentariosOriginales) {
        throw new Error("Comentario no encontrado");
    }

    await producto.save();
    return producto;
};
