// src/routes/v1/mercadopago.js
import { Router } from 'express';
import { createPreference, processWebhook } from '../../controllers/mercadopagoController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post('/crear-preferencia', authMiddleware, createPreference);
router.post('/mercadopago-webhook', processWebhook);

export default router;