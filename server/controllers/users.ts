import { Request, Response } from 'express';
import { getAllUsers, getRecentlyActiveUsers, getUserStats, getUsersByStatus } from '../services/database.js';
import { dbPerformanceMonitor } from '../services/databasePerformance.js';
import { Logger } from '../utils/logger.js';

export class UsersController {
    // Obtener todos los usuarios registrados (optimizado con cache)
    static async getAllUsers(_req: Request, res: Response): Promise<void> {
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

    // Obtener estadísticas de usuarios (optimizado con consulta única)
    static async getUserStats(_req: Request, res: Response): Promise<void> {
        try {
            const stats = await getUserStats();

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

    // Nuevo endpoint para obtener usuarios por status
    static async getUsersByStatus(req: Request, res: Response): Promise<void> {
        try {
            const { status } = req.params;
            
            if (!status || !['online', 'away', 'offline'].includes(status)) {
                res.status(400).json({
                    success: false,
                    error: 'Status inválido. Debe ser: online, away, offline'
                });
                return;
            }

            const users = await getUsersByStatus(status);

            res.json({
                success: true,
                data: { users, status }
            });

        } catch (error) {
            Logger.error('Error obteniendo usuarios por status', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Nuevo endpoint para obtener usuarios activos recientemente
    static async getRecentlyActiveUsers(req: Request, res: Response): Promise<void> {
        try {
            const hours = parseInt(req.query['hours'] as string) || 24;
            
            if (hours < 1 || hours > 168) { // Máximo 1 semana
                res.status(400).json({
                    success: false,
                    error: 'Horas inválidas. Debe estar entre 1 y 168'
                });
                return;
            }

            const users = await getRecentlyActiveUsers(hours);

            res.json({
                success: true,
                data: { users, hours }
            });

        } catch (error) {
            Logger.error('Error obteniendo usuarios activos recientemente', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Nuevo endpoint para obtener métricas de performance de base de datos
    static async getDatabasePerformance(_req: Request, res: Response): Promise<void> {
        try {
            const stats = dbPerformanceMonitor.getPerformanceStats();
            const slowestQueries = dbPerformanceMonitor.getSlowestQueries(5);
            const failedQueries = dbPerformanceMonitor.getFailedQueries(5);

            res.json({
                success: true,
                data: {
                    stats,
                    slowestQueries,
                    failedQueries
                }
            });

        } catch (error) {
            Logger.error('Error obteniendo métricas de performance', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Endpoint para resetear métricas de performance
    static async resetDatabasePerformance(_req: Request, res: Response): Promise<void> {
        try {
            dbPerformanceMonitor.resetMetrics();

            res.json({
                success: true,
                message: 'Métricas de performance reseteadas'
            });

        } catch (error) {
            Logger.error('Error reseteando métricas de performance', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
} 