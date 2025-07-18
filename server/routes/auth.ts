import { Router } from 'express';
import { AuthController } from '../controllers/auth.js';
import { authenticateToken, rateLimit } from '../middleware/auth.js';

const router = Router();

// Rate limiting para endpoints de autenticación
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 intentos por 15 minutos

// Registro de usuario
router.post('/register', authRateLimit, AuthController.register);

// Inicio de sesión
router.post('/login', authRateLimit, AuthController.login);

// Obtener perfil del usuario (requiere autenticación)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Verificar token
router.post('/verify', AuthController.verifyToken);

export default router; 