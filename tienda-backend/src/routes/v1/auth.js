// src/routes/v1/auth.js
import { Router } from 'express';
import { login, register, refreshToken, logout } from '../../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/registro', register);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;