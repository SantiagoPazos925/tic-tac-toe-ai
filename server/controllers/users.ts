import { Request, Response } from 'express';
import { getAllUsers } from '../services/database.js';
import { Logger } from '../utils/logger.js';

export class UsersController {
    // Obtener todos los usuarios registrados
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await getAllUsers();

            res.json({
                success: true,
                data: { users }
            });

        } catch (error) {
            Logger.error('Error obteniendo usuarios', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener estadísticas de usuarios
    static async getUserStats(req: Request, res: Response) {
        try {
            const users = await getAllUsers();

            const stats = {
                total: users.length,
                online: users.filter(u => u.status === 'online').length,
                away: users.filter(u => u.status === 'away').length,
                offline: users.filter(u => u.status === 'offline').length,
                recentlyActive: users.filter(u => {
                    if (!u.last_login) return false;
                    const lastLogin = new Date(u.last_login);
                    const now = new Date();
                    const diffInHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
                    return diffInHours < 24; // Últimas 24 horas
                }).length
            };

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            Logger.error('Error obteniendo estadísticas de usuarios', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
} 