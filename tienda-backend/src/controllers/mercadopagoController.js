// src/controllers/mercadopagoController.js (Código corregido)
import * as mercadopagoService from '../services/mercadopagoService.js';
import { logError, logSuccess } from '../utils/logger.js';

/**
 * Crea una preferencia de pago en Mercado Pago.
 * Es llamado desde el frontend para iniciar el proceso de pago.
 */
export const createPreference = async (req, res) => {
    try {
        const pedidoData = req.body; // <--- CORRECCIÓN: Leer el cuerpo directamente
        const userId = req.user.id; // El ID del usuario viene del middleware de autenticación

        const { init_point, pedidoId } = await mercadopagoService.createMercadoPagoPreference(pedidoData, userId);
        
        logSuccess(`Preferencia de pago creada con éxito para el pedido ${pedidoId}`);
        res.status(200).json({ init_point, pedidoId });
    } catch (error) {
        logError('Error al crear la preferencia de pago:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
};

/**
 * Procesa las notificaciones de webhooks de Mercado Pago.
 * Es llamado por Mercado Pago de forma automática.
 */
export const processWebhook = async (req, res) => {
    try {
        logSuccess('Webhook de Mercado Pago recibido');
        await mercadopagoService.processMercadoPagoWebhook(req.body);
        res.status(200).send('Webhook procesado con éxito');
    } catch (error) {
        logError('Error al procesar el webhook:', error);
        res.status(500).send('Error interno del servidor');
    }
};