// src/controllers/categoriaController.js
import Categoria from '../models/Categoria.js';
import { logError } from '../utils/logger.js';

export const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.json(categorias);
    } catch (error) {
        logError('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

export const createCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;
        const categoriaExistente = await Categoria.findOne({ nombre });
        if (categoriaExistente) {
            return res.status(409).json({ error: 'Ya existe una categoría con este nombre.' });
        }
        const nueva = new Categoria({ nombre });
        await nueva.save();
        res.status(201).json(nueva);
    } catch (err) {
        logError('Error al crear categoría:', err);
        res.status(500).json({ error: 'Error del servidor. Inténtalo de nuevo.' });
    }
};

export const deleteCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByIdAndDelete(req.params.id);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json({ msg: 'Categoría eliminada correctamente' });
    } catch (err) {
        logError('Error al eliminar categoría:', err);
        res.status(500).json({ error: 'Error del servidor. Inténtalo de nuevo.' });
    }
};