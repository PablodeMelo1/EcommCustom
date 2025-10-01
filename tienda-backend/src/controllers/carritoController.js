// src/controllers/carritoController.js
import Carrito from '../models/Carrito.js';
import { logError } from '../utils/logger.js';

export const getCarrito = async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ userId: req.params.userId });
        res.json(carrito || { userId: req.params.userId, items: [] });
    } catch (error) {
        logError('Error al obtener el carrito:', error);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
};


export const saveCarrito = async (req, res) => { // <-- Cambiar el nombre aquí
    try {
        const { items } = req.body;
        const itemsValidados = items.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image || 'https://via.placeholder.com/500',
            quantity: i.quantity || 1,
            color: i.color || null,
            talle: i.talle || null
        }));

        let carrito = await Carrito.findOne({ userId: req.params.userId });
        if (carrito) {
            carrito.items = itemsValidados;
        } else {
            carrito = new Carrito({ userId: req.params.userId, items: itemsValidados });
        }
        await carrito.save();
        res.status(200).json(carrito);
    } catch (error) {
        logError('Error al guardar el carrito:', error);
        res.status(500).json({ error: 'Error al guardar el carrito' });
    }
};

export const updateCarrito = async (req, res) => {
    try {
        const { items } = req.body;
        const itemsValidados = items.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image || 'https://via.placeholder.com/500',
            quantity: i.quantity || 1,
            color: i.color || null,
            talle: i.talle || null
        }));

        let carrito = await Carrito.findOne({ userId: req.params.userId });
        if (carrito) {
            carrito.items = itemsValidados;
        } else {
            carrito = new Carrito({ userId: req.params.userId, items: itemsValidados });
        }
        await carrito.save();
        res.status(200).json(carrito);
    } catch (error) {
        logError('Error al guardar el carrito:', error);
        res.status(500).json({ error: 'Error al guardar el carrito' });
    }
};

export const deleteCarrito = async (req, res) => {
    try {
        await Carrito.findOneAndDelete({ userId: req.params.userId });
        res.status(200).json({ mensaje: 'Carrito eliminado' });
    } catch (error) {
        logError('Error al eliminar el carrito:', error);
        res.status(500).json({ error: 'Error al eliminar el carrito' });
    }
};