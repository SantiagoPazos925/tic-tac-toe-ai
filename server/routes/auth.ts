import { Router } from 'express';
import { authenticateToken, rateLimit, clearRateLimit } from '../middleware/auth.js';
import { AuthController } from '../controllers/auth.js';

const router = Router();

// Rate limiting para endpoints de autenticación (aumentado para desarrollo)
const authRateLimit = rateLimit(50, 15 * 60 * 1000); // 50 intentos por 15 minutos (antes era 5)

// Registro de usuario
router.post('/register', authRateLimit, AuthController.register);

// Inicio de sesión
router.post('/login', authRateLimit, AuthController.login);

// Endpoint para limpiar rate limiting en desarrollo
router.post('/clear-rate-limit', (req, res) => {
    if (process.env.NODE_ENV === 'development') {
        clearRateLimit();
        res.json({ success: true, message: 'Rate limiting limpiado' });
    } else {
        res.status(403).json({ success: false, error: 'Solo disponible en desarrollo' });
    }
});

// Obtener perfil del usuario (requiere autenticación)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Verificar token
router.post('/verify', AuthController.verifyToken);

export default router; 