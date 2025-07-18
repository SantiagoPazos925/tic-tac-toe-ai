import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { Logger } from '../utils/logger.js';

// Middleware para verificar token JWT
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        Logger.auth('Intento de acceso sin token');
        return res.status(401).json({
            success: false,
            error: 'Token requerido'
        });
    }

    const user = AuthService.verifyToken(token);
    if (!user) {
        Logger.auth('Token inválido');
        return res.status(403).json({
            success: false,
            error: 'Token inválido'
        });
    }

    req.user = user;
    next();
}

// Middleware para verificar si el usuario está autenticado (opcional)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const user = AuthService.verifyToken(token);
        if (user) {
            req.user = user;
        }
    }

    next();
}

// Middleware para verificar roles (para futuras implementaciones)
export function requireRole(role: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        // Aquí se puede agregar lógica de roles cuando se implemente
        // Por ahora, todos los usuarios autenticados tienen acceso
        next();
    };
}

// Middleware para rate limiting básico
export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        const userRequests = requests.get(ip);

        if (!userRequests || now > userRequests.resetTime) {
            requests.set(ip, { count: 1, resetTime: now + windowMs });
        } else {
            userRequests.count++;

            if (userRequests.count > maxRequests) {
                Logger.warn(`Rate limit excedido para IP: ${ip}`);
                return res.status(429).json({
                    success: false,
                    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
                });
            }
        }

        next();
    };
}

// Middleware para logging de requests
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const method = req.method;
        const url = req.url;
        const status = res.statusCode;
        const ip = req.ip || req.connection.remoteAddress || 'unknown';

        Logger.info(`${method} ${url} - ${status} - ${duration}ms - ${ip}`);
    });

    next();
}

// Middleware para manejo de errores
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    Logger.error('Error en request', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress
    });

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
} 