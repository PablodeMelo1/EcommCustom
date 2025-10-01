// src/services/authService.js
import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Autentica a un usuario y genera tokens de acceso y refresco.
 * @param {string} mail - El correo electrónico del usuario.
 * @param {string} contra - La contraseña del usuario.
 * @returns {Promise<{accessToken: string, refreshToken: string, usuario: object}>}
 */
export const loginUser = async (mail, contra) => {
    const usuario = await Usuario.findOne({ mail });
    if (!usuario || usuario.contra !== contra) {
        throw new Error('Credenciales inválidas');
    }

    const payload = { id: usuario._id, role: usuario.role, mail: usuario.mail };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '3m' });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '60d' });

    return {
        accessToken,
        refreshToken,
        usuario: { _id: usuario._id, nombre: usuario.nombre, role: usuario.role }
    };
};

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Los datos del nuevo usuario (mail, nombre, telefono, contra).
 * @returns {Promise<object>} El nuevo usuario creado.
 */
export const registerUser = async (userData) => {
    const existingUser = await Usuario.findOne({ mail: userData.mail });
    if (existingUser) {
        throw new Error('Usuario ya existente');
    }
    const newUser = new Usuario(userData);
    await newUser.save();
    return newUser;
};

/**
 * Refresca un token de acceso a partir de un token de refresco.
 * @param {string} refreshToken - El token de refresco.
 * @returns {Promise<string>} El nuevo token de acceso.
 */
export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('No se encontró el refresh token.');
    }
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
        throw new Error('Usuario no encontrado.');
    }
    const payload = { id: usuario._id, role: usuario.role, mail: usuario.mail };
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '3m' });
    return newAccessToken;
};