// src/services/pedidoService.js
import Pedido from '../models/pedido.js';
import Producto from '../models/Producto.js';
import Carrito from '../models/Carrito.js';
import { nanoid } from 'nanoid';

/**
 * Crea un nuevo pedido con un método de pago que no sea Mercado Pago.
 * @param {object} pedidoData - Datos del pedido a crear.
 * @param {string} userId - ID del usuario que realiza el pedido.
 * @returns {Promise<object>} El pedido creado.
 */
export const createPedido = async (pedidoData, userId) => {
    const { items, paymentMethod } = pedidoData;

    if (!items || items.length === 0) {
        throw new Error('El carrito está vacío');
    }

    // Verificar stock para cada producto
    for (const item of items) {
        const producto = await Producto.findById(item.productId);
        if (!producto) {
            throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }
        if (producto.stock < item.quantity) {
            throw new Error(`No hay suficiente stock para ${item.name}, stock restante: ${producto.stock}`);
        }
    }

    const nuevoPedido = new Pedido({
        numeroPedido: nanoid(8),
        userId,
        ...pedidoData,
        estado: (paymentMethod === "mercado_pago") ? "pago" : "pendiente",
        fecha: new Date()
    });

    // Actualizar stock si el método de pago no es Mercado Pago (ya que MP se encarga del stock vía webhook)
    if (paymentMethod !== "mercado_pago") {
        for (const item of items) {
            await Producto.updateOne(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } }
            );
        }
    }

    await nuevoPedido.save();
    // Eliminar el carrito después de crear el pedido
    await Carrito.findOneAndDelete({ userId });

    return nuevoPedido;
};

/**
 * Obtiene todos los pedidos (solo para administradores).
 * @returns {Promise<Array>} Lista de pedidos.
 */
export const getAllPedidos = async () => {
    return await Pedido.find().populate('userId', 'nombre mail nroTelefono').sort({ fecha: -1 });
};

/**
 * Obtiene todos los pedidos de un cliente específico.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<Array>} Lista de pedidos del usuario.
 */
export const getPedidosByCliente = async (userId) => {
    return await Pedido.find({ userId }).sort({ fecha: -1 });
};

/**
 * Obtiene un pedido por su ID.
 * @param {string} pedidoId - El ID del pedido.
 * @returns {Promise<object>} El pedido encontrado.
 */
export const getPedidoById = async (pedidoId) => {
    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) {
        throw new Error('Pedido no encontrado');
    }
    return pedido;
};

/**
 * Actualiza el estado de un pedido (solo para administradores).
 * @param {string} pedidoId - El ID del pedido a actualizar.
 * @param {string} nuevoEstado - El nuevo estado del pedido.
 * @returns {Promise<object>} El pedido actualizado.
 */
export const updatePedidoEstado = async (pedidoId, nuevoEstado) => {
    const pedido = await Pedido.findByIdAndUpdate(pedidoId, { estado: nuevoEstado }, { new: true });
    if (!pedido) {
        throw new Error('Pedido no encontrado');
    }
    return pedido;
};