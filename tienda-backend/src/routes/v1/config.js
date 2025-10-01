// src/routes/v1/config.js
import { Router } from 'express';
import { getConfig, updateConfig } from '../../controllers/configController.js';
import { logoUpload } from '../../middlewares/multerMiddleware.js';

const router = Router();

router.get('/', getConfig);
router.post('/', logoUpload.single('logo'), updateConfig);

export default router;