// src/controllers/pedidoController.js
import * as pedidoService from '../services/pedidoService.js';
import { logError } from '../utils/logger.js';

export const createPedido = async (req, res) => {
    try {
        const nuevoPedido = await pedidoService.createPedido(req.body, req.user.id);
        res.status(201).json({ mensaje: 'Pedido creado con éxito', pedido: nuevoPedido });
    } catch (error) {
        logError('Error al crear pedido:', error);
        // El servicio lanza errores específicos, los manejamos aquí
        if (error.message.includes('stock')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
};

export const getPedidos = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        const pedidos = await pedidoService.getAllPedidos();
        res.json(pedidos);
    } catch (error) {
        logError('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

export const getPedidosCliente = async (req, res) => {
    try {
        const pedidos = await pedidoService.getPedidosByCliente(req.user.id);
        res.json(pedidos);
    } catch (error) {
        logError('Error al obtener pedidos del cliente:', error);
        res.status(500).json({ error: 'No se pudieron obtener los pedidos' });
    }
};

export const getPedidoById = async (req, res) => {
    try {
        const pedido = await pedidoService.getPedidoById(req.params.id);
        res.json(pedido);
    } catch (error) {
        logError('Error al obtener pedido:', error);
        res.status(404).json({ error: 'Pedido no encontrado' });
    }
};

export const updatePedidoEstado = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        const updatedPedido = await pedidoService.updatePedidoEstado(req.params.id, req.body.estado);
        res.json(updatedPedido);
    } catch (error) {
        logError('Error al actualizar estado:', error);
        res.status(404).json({ error: 'Pedido no encontrado' });
    }
};