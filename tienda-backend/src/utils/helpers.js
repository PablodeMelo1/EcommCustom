/**
 * src/utils/helpers.js
 * Funciones de ayuda reutilizables.
 */

import Categoria from '../models/Categoria.js';

/**
 * Normaliza los valores booleanos de un objeto.
 * @param {object} data - El objeto con los datos a normalizar.
 * @param {string[]} fields - Un array de nombres de campos que deben ser booleanos.
 * @returns {object} El objeto con los valores booleanos normalizados.
 */
export const normalizeBooleans = (data, fields) => {
    const normalizedData = { ...data };
    fields.forEach(field => {
        if (normalizedData[field] !== undefined) {
            normalizedData[field] = normalizedData[field] === 'true' || normalizedData[field] === true;
        }
    });
    return normalizedData;
};

/**
 * Valida y formatea una fila de datos de producto desde una hoja de cálculo.
 * @param {object} data - La fila de datos de la hoja de cálculo.
 * @param {number} rowNumber - El número de fila para reportar errores.
 * @returns {Promise<{producto: object, errores: string[]}>} El objeto de producto formateado o un array de errores.
 */
export const validateAndFormatProduct = async (data, rowNumber) => {
    const errores = [];
    
    // 1. Validar campos obligatorios
    if (!data.nombre || !data.precio || !data.stock) {
        errores.push(`Error en la fila ${rowNumber}: Faltan campos obligatorios (nombre, precio, stock).`);
        return { producto: null, errores };
    }

    // 2. Validar tipos de datos
    const precio = parseFloat(data.precio);
    const stock = parseInt(data.stock, 10);
    if (isNaN(precio) || isNaN(stock) || precio < 0 || stock < 0) {
        errores.push(`Error en la fila ${rowNumber}: Los campos 'precio' y 'stock' deben ser números válidos y positivos.`);
        return { producto: null, errores };
    }

    // 3. Validar y obtener ID de categoría
    let categoriaId = null;
    if (data.categoria) {
        const categoria = await Categoria.findOne({ nombre: data.categoria.trim() });
        if (!categoria) {
            errores.push(`Error en la fila ${rowNumber}: La categoría "${data.categoria}" no existe.`);
            return { producto: null, errores };
        }
        categoriaId = categoria._id;
    }

    // 4. Normalizar booleanos
    const normalizedData = normalizeBooleans(data, ['oferta', 'destacado']);

    // 5. Crear el objeto de producto final
    const nuevoProducto = {
        nombre: data.nombre,
        precio: precio,
        stock: stock,
        descripcion: data.descripcion || '',
        img: data.img || '',
        oferta: normalizedData.oferta,
        descuento: parseInt(data.descuento) || 0,
        categoria: categoriaId,
        destacado: normalizedData.destacado
    };

    return { producto: nuevoProducto, errores };
};