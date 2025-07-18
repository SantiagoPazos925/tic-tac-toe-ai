import { Request, Response } from 'express';
import { AuthService } from '../services/auth.js';
import { LoginRequest, RegisterRequest, AuthenticatedRequest } from '../types/index.js';
import { ValidationError } from '../utils/validation.js';
import { Logger } from '../utils/logger.js';

export class AuthController {
    // Registro de usuario
    static async register(req: Request, res: Response) {
        try {
            const userData: RegisterRequest = req.body;
            const result = await AuthService.register(userData);

            res.status(201).json({
                success: true,
                ...result
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            Logger.error('Error en registro', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Inicio de sesión
    static async login(req: Request, res: Response) {
        try {
            const loginData: LoginRequest = req.body;
            const result = await AuthService.login(loginData);

            res.json({
                success: true,
                ...result
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(401).json({
                    success: false,
                    error: error.message
                });
            }

            Logger.error('Error en login', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener perfil del usuario
    static async getProfile(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }

            const user = await AuthService.getProfile(req.user.username);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            Logger.error('Error obteniendo perfil', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Verificar token (para validar tokens en el frontend)
    static async verifyToken(req: Request, res: Response) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Token requerido'
                });
            }

            const user = AuthService.verifyToken(token);
            if (!user) {
                return res.status(403).json({
                    success: false,
                    error: 'Token inválido'
                });
            }

            res.json({
                success: true,
                data: { valid: true, user }
            });

        } catch (error) {
            Logger.error('Error verificando token', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
} 