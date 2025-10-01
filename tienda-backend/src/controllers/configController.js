// src/controllers/configController.js
import Config from '../models/Config.js';
import { logError } from '../utils/logger.js';
import { normalizeBooleans } from '../utils/helpers.js';

export const getConfig = async (req, res) => {
    try {
        const config = await Config.findOne();
        res.json(config);
    } catch (error) {
        logError('Error al obtener configuración:', error);
        res.status(500).json({ error: 'Error al obtener la configuración' });
    }
};

export const updateConfig = async (req, res) => {
    try {
        let config = await Config.findOne();
        const updateData = {};

        for (const key in req.body) {
            updateData[key] = req.body[key];
        }

        if (req.file) {
            updateData.logoUrl = `/uploads/${req.file.filename}`;
        }
        
        if (updateData.transferenciaCuentas && typeof updateData.transferenciaCuentas === 'string') {
            try {
                updateData.transferenciaCuentas = JSON.parse(updateData.transferenciaCuentas);
            } catch (parseError) {
                logError('Error al parsear transferenciaCuentas:', parseError);
                return res.status(400).json({ error: 'El formato de las cuentas de transferencia es inválido.' });
            }
        }
        
        const booleanFields = [
            'igCheck', 'xCheck', 'fbCheck', 'ttCheck', 'wpCheck', 'emailCheck',
            'mercadoPagoCheck', 'transferenciaCheck', 'efectivoCheck', 'retiroLocalCheck'
        ];
        const normalizedData = normalizeBooleans(updateData, booleanFields);

        if (!config) {
            config = new Config(normalizedData);
        } else {
            Object.assign(config, normalizedData);
        }

        await config.save();
        res.json({ message: 'Configuración guardada correctamente', config });
    } catch (error) {
        logError('Error al guardar configuración:', error);
        res.status(500).json({ error: 'Error al guardar la configuración' });
    }
};