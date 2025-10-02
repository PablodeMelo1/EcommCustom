import Config from '../models/Config.js';
import { logError } from '../utils/logger.js';
import { normalizeBooleans } from '../utils/helpers.js';
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from 'uuid';
import streamifier from 'streamifier';

const uploadToCloudinary = (fileBuffer, publicId) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { public_id: publicId, overwrite: true },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

export const updateConfig = async (req, res) => {
    try {
        let config = await Config.findOne();
        const updateData = { ...req.body };

        // Subir logo a Cloudinary si viene archivo
        if (req.file) {
            const publicId = `logos/${uuidv4()}`;
            const result = await uploadToCloudinary(req.file.buffer, publicId);
            updateData.logoUrl = result.secure_url;
            updateData.logoPublicId = publicId;
        }

        // Parsear transferenciaCuentas si viene como string
        if (updateData.transferenciaCuentas && typeof updateData.transferenciaCuentas === 'string') {
            try {
                updateData.transferenciaCuentas = JSON.parse(updateData.transferenciaCuentas);
            } catch (parseError) {
                logError('Error al parsear transferenciaCuentas:', parseError);
                return res.status(400).json({ error: 'El formato de las cuentas de transferencia es inválido.' });
            }
        }

        // Normalizar campos booleanos
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

export const getConfig = async (req, res) => {
    try {
        const config = await Config.findOne();
        res.json(config);
    } catch (error) {
        logError('Error al obtener configuración:', error);
        res.status(500).json({ error: 'Error al obtener la configuración' });
    }
};
