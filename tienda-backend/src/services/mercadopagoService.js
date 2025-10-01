// src/services/mercadopagoService.js
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import Config from '../models/Config.js';
import Pedido from '../models/pedido.js';
import Producto from '../models/producto.js';
import { logSuccess, logError } from '../utils/logger.js';
import { nanoid } from 'nanoid';
import 'dotenv/config';

/**
 * Crea una preferencia de pago en Mercado Pago y un pedido inicial en la base de datos.
 * @param {object} pedidoData - Los datos del pedido para crear la preferencia.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<object>} El objeto con el punto de inicio de pago y el ID del pedido.
 */
export const createMercadoPagoPreference = async (pedidoData, userId) => {
    const nuevoPedido = new Pedido({
        numeroPedido: nanoid(8),
        userId,
        ...pedidoData,
        paymentMethod: 'mercado_pago',
        estado: 'pendiente',
        fecha: new Date()
    });
    await nuevoPedido.save();
    logSuccess(`Pedido inicial creado con ID: ${nuevoPedido._id}`);

    const config = await Config.findOne();
    if (!config || !config.accessTokenMP) {
        throw new Error('Falta el token de Mercado Pago del administrador.');
    }

    const mp = new MercadoPagoConfig({ accessToken: config.accessTokenMP });
    const preferenceData = {
        items: pedidoData.items.map(item => ({
            title: item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: 'UYU'
        })),
        back_urls: {
            success: `${process.env.FRONTEND_URL}/checkoutExito?pedidoId=${nuevoPedido._id}`,
            failure: `${process.env.FRONTEND_URL}/checkoutExito?pedidoId=${nuevoPedido._id}`,
            pending: `${process.env.FRONTEND_URL}/checkoutExito?pedidoId=${nuevoPedido._id}`
        },
        notification_url: process.env.NGROK_URL, // Usar variable de entorno
        metadata: {
            userId,
            pedidoId: nuevoPedido._id.toString()
        }
    };

    const client = new Preference(mp);
    const result = await client.create({ body: preferenceData });
    return { init_point: result.init_point, pedidoId: nuevoPedido._id };
};

/**
 * Procesa una notificación de webhook de Mercado Pago.
 * @param {object} body - El cuerpo de la solicitud del webhook.
 * @returns {Promise<void>}
 */
export const processMercadoPagoWebhook = async (body) => {
    const topic = body.topic || body.type;
    const paymentId = body.data?.id;

    if (topic === 'payment' && paymentId) {
        try {
            const config = await Config.findOne();
            if (!config || !config.accessTokenMP) {
                logError('Falta el token de Mercado Pago del administrador.');
                return;
            }

            const mp = new MercadoPagoConfig({ accessToken: config.accessTokenMP });
            const paymentClient = new Payment(mp);
            const payment = await paymentClient.get({ id: paymentId });
            
            const pedidoId = payment.metadata?.pedidoId;

            const paymentStatus = payment.status;

            if (pedidoId) {
                const pedido = await Pedido.findById(pedidoId);
                if (pedido) {
                    switch (paymentStatus) {
                        case 'approved':
                            if (pedido.estado !== 'pago') {
                            for (const item of pedido.items) {
                                await Producto.updateOne(
                                    { _id: item.productId },
                                    { $inc: { stock: -item.quantity } }
                                );
                            }
                            pedido.estado = 'pago';
                            pedido.paymentIdMP = paymentId;
                        }
                        break;

                        case 'rejected':
                            pedido.estado = 'fallido';
                            break;
                        case 'in_process':
                            pedido.estado = 'en_proceso';
                            break;
                        default:
                            logError(`Estado de pago no manejado: ${paymentStatus}`);
                            break;
                    }
                    await pedido.save();
                    logSuccess(`Pedido ${pedidoId} actualizado a "${pedido.estado}"`);
                }
            }
        } catch (err) {
            logError('Error al procesar webhook:', err);
            throw err;
        }
    }
};