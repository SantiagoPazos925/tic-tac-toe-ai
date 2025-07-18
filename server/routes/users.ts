import { Router } from 'express';
import { UsersController } from '../controllers/users.js';
import { rateLimit } from '../middleware/auth.js';

const router = Router();

// Rate limiting para endpoints de usuarios
const userRateLimit = rateLimit(100, 15 * 60 * 1000); // 100 requests por 15 minutos

// Obtener todos los usuarios
router.get('/', userRateLimit, UsersController.getAllUsers);

// Obtener estadísticas de usuarios
router.get('/stats', userRateLimit, UsersController.getUserStats);

export default router; 