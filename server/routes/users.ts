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

// Obtener usuarios por status (nuevo endpoint optimizado)
router.get('/status/:status', userRateLimit, UsersController.getUsersByStatus);

// Obtener usuarios activos recientemente (nuevo endpoint optimizado)
router.get('/recent', userRateLimit, UsersController.getRecentlyActiveUsers);

// Endpoints de monitoreo de performance (solo para desarrollo/admin)
router.get('/performance', userRateLimit, UsersController.getDatabasePerformance);
router.post('/performance/reset', userRateLimit, UsersController.resetDatabasePerformance);

export default router; 