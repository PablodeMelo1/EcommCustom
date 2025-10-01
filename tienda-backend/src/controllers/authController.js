import * as authService from '../services/authService.js';
import { logError } from '../utils/logger.js';

export const login = async (req, res) => {
    try {
        const { mail, contra } = req.body;
        const { accessToken, refreshToken, usuario } = await authService.loginUser(mail, contra);
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
        });
        
        res.json({ accessToken, usuario });
    } catch (error) {
        logError('Error en login:', error);
        res.status(401).json({ error: error.message });
    }
};

export const register = async (req, res) => {
    try {
        // Guardar el password en una variable antes de que se modifique
        const { contra } = req.body; // <--- NUEVA LÍNEA

        // 1. Registrar al usuario
        const newUser = await authService.registerUser(req.body);

        // 2. Si el registro fue exitoso, proceder con el login
        const { accessToken, refreshToken, usuario } = await authService.loginUser(newUser.mail, contra); // <--- USAR LA VARIABLE

        // 3. Enviar la cookie y los tokens como en la función de login
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
        });

        res.status(201).json({ 
            message: 'Usuario registrado y logueado correctamente', 
            accessToken, 
            usuario 
        });
    } catch (error) {
        logError('Error en registro:', error);
        res.status(400).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken"); // Elimina la cookie del refreshToken
        res.status(200).json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
        logError('Error al cerrar sesión:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const newAccessToken = await authService.refreshAccessToken(req.cookies.refreshToken);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        logError('Error al refrescar token:', error);
        res.status(403).json({ error: error.message });
    }
};