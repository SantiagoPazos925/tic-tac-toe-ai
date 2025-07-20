import bcrypt from 'bcryptjs';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { databaseConfig } from '../config/index.js';
import { User, UserProfile } from '../types/index.js';
import { Logger } from '../utils/logger.js';
import { DatabasePerformanceMonitor } from './databasePerformance.js';

// Clase abstracta para operaciones de base de datos
abstract class DatabaseService {
    abstract init(): Promise<void>;
    abstract createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User>;
    abstract findUserByUsername(username: string): Promise<User | null>;
    abstract findUserByEmail(email: string): Promise<User | null>;
    abstract updateUserStatus(userId: number, status: string): Promise<void>;
    abstract getAllUsers(): Promise<UserProfile[]>;
    abstract verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    
    // Nuevos métodos optimizados
    abstract getUserStats(): Promise<{
        total: number;
        online: number;
        away: number;
        offline: number;
        recentlyActive: number;
    }>;
    abstract getUsersByStatus(status: string): Promise<UserProfile[]>;
    abstract getRecentlyActiveUsers(hours?: number): Promise<UserProfile[]>;
}

// Implementación para SQLite
class SQLiteService extends DatabaseService {
    private db!: Database;
    private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    private readonly CACHE_TTL = 30000; // 30 segundos

    async init(): Promise<void> {
        this.db = await open({
            filename: './users.db',
            driver: sqlite3.Database
        });

        await this.createTables();
        Logger.database('Base de datos SQLite inicializada');
    }

    // Método para limpiar cache expirado
    private cleanupCache(): void {
        const now = Date.now();
        for (const [key, value] of this.queryCache.entries()) {
            if (now - value.timestamp > value.ttl) {
                this.queryCache.delete(key);
            }
        }
    }

    // Método para obtener datos del cache
    private getFromCache<T>(key: string): T | null {
        this.cleanupCache();
        const cached = this.queryCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
            DatabasePerformanceMonitor.getInstance().recordCacheHit();
            return cached.data as T;
        }
        DatabasePerformanceMonitor.getInstance().recordCacheMiss();
        return null;
    }

    // Método para guardar datos en cache
    private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
        this.queryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    // Método para invalidar cache
    private invalidateCache(pattern: string): void {
        for (const key of this.queryCache.keys()) {
            if (key.includes(pattern)) {
                this.queryCache.delete(key);
            }
        }
    }

    private async createTables(): Promise<void> {
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                status TEXT DEFAULT 'offline'
            )
        `);

        // Crear índices para optimizar consultas frecuentes
        await this.createIndexes();
    }

    private async createIndexes(): Promise<void> {
        // Índice para búsquedas por username (ya existe UNIQUE, pero es bueno documentarlo)
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
        
        // Índice para búsquedas por email
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        
        // Índice para consultas por status (muy usado en estadísticas)
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)');
        
        // Índice para consultas por last_login (usado en ordenamiento y estadísticas)
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login)');
        
        // Índice compuesto para consultas de usuarios activos recientemente
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_status_last_login ON users(status, last_login)');
        
        Logger.database('Índices de base de datos creados/verificados');
    }

    async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password_hash, 10);

        const result = await this.db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [userData.username, userData.email, hashedPassword]
        );

        // Invalidar cache después de crear usuario
        this.invalidateCache('all_users');
        this.invalidateCache('user_stats');

        return {
            id: result.lastID || 0,
            username: userData.username,
            email: userData.email,
            password_hash: hashedPassword,
            created_at: new Date(),
            status: 'offline'
        };
    }

    async findUserByUsername(username: string): Promise<User | null> {
        const result = await this.db.get('SELECT * FROM users WHERE username = ?', [username]);
        return result || null;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const result = await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
        return result || null;
    }

    async updateUserStatus(userId: number, status: string): Promise<void> {
        await this.db.run(
            'UPDATE users SET status = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [status, userId]
        );
        
        // Invalidar cache relacionado con usuarios y estadísticas
        this.invalidateCache('all_users');
        this.invalidateCache('user_stats');
        this.invalidateCache('users_by_status');
        this.invalidateCache('recently_active');
    }

    async getAllUsers(): Promise<UserProfile[]> {
        return await DatabasePerformanceMonitor.measureQuery('getAllUsers', async () => {
            // Intentar obtener del cache primero
            const cacheKey = 'all_users';
            const cached = this.getFromCache<UserProfile[]>(cacheKey);
            if (cached) {
                return cached;
            }

            // Consulta optimizada con índices
            const result = await this.db.all(`
                SELECT id, username, email, created_at, last_login, status 
                FROM users 
                ORDER BY last_login DESC NULLS LAST
            `);

            // Guardar en cache
            this.setCache(cacheKey, result, 15000); // Cache más corto para datos dinámicos
            return result;
        });
    }

    // Nuevo método optimizado para estadísticas
    async getUserStats(): Promise<{
        total: number;
        online: number;
        away: number;
        offline: number;
        recentlyActive: number;
    }> {
        return await DatabasePerformanceMonitor.measureQuery('getUserStats', async () => {
            const cacheKey = 'user_stats';
            const cached = this.getFromCache<{
                total: number;
                online: number;
                away: number;
                offline: number;
                recentlyActive: number;
            }>(cacheKey);
            if (cached) {
                return cached;
            }

            // Consulta optimizada que obtiene todas las estadísticas en una sola query
            const result = await this.db.get(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online,
                    SUM(CASE WHEN status = 'away' THEN 1 ELSE 0 END) as away,
                    SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline,
                    SUM(CASE 
                        WHEN last_login IS NOT NULL 
                        AND datetime(last_login) > datetime('now', '-24 hours') 
                        THEN 1 ELSE 0 END) as recentlyActive
                FROM users
            `);

            const stats = {
                total: result.total || 0,
                online: result.online || 0,
                away: result.away || 0,
                offline: result.offline || 0,
                recentlyActive: result.recentlyActive || 0
            };

            this.setCache(cacheKey, stats, 10000); // Cache corto para estadísticas
            return stats;
        });
    }

    // Método optimizado para obtener usuarios por status
    async getUsersByStatus(status: string): Promise<UserProfile[]> {
        const cacheKey = `users_by_status_${status}`;
        const cached = this.getFromCache<UserProfile[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const result = await this.db.all(`
            SELECT id, username, email, created_at, last_login, status 
            FROM users 
            WHERE status = ? 
            ORDER BY last_login DESC NULLS LAST
        `, [status]);

        this.setCache(cacheKey, result, 20000);
        return result;
    }

    // Método optimizado para obtener usuarios activos recientemente
    async getRecentlyActiveUsers(hours: number = 24): Promise<UserProfile[]> {
        const cacheKey = `recently_active_${hours}`;
        const cached = this.getFromCache<UserProfile[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const result = await this.db.all(`
            SELECT id, username, email, created_at, last_login, status 
            FROM users 
            WHERE last_login IS NOT NULL 
            AND datetime(last_login) > datetime('now', '-${hours} hours')
            ORDER BY last_login DESC
        `);

        this.setCache(cacheKey, result, 15000);
        return result;
    }

    async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}

// Implementación para PostgreSQL
class PostgreSQLService extends DatabaseService {
    private pool: any; // Usar any para evitar problemas con pg

    async init(): Promise<void> {
        const { Pool } = await import('pg');
        this.pool = new Pool({
            connectionString: databaseConfig.connectionString,
            ssl: databaseConfig.ssl ? {
                rejectUnauthorized: false
            } : false
        });

        await this.createTables();
        Logger.database('Base de datos PostgreSQL inicializada');
    }

    private async createTables(): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'offline'
                )
            `);
        } finally {
            client.release();
        }
    }

    async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password_hash, 10);
        const client = await this.pool.connect();

        try {
            const result = await client.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
                [userData.username, userData.email, hashedPassword]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async findUserByUsername(username: string): Promise<User | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    async updateUserStatus(userId: number, status: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                'UPDATE users SET status = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2',
                [status, userId]
            );
        } finally {
            client.release();
        }
    }

    async getAllUsers(): Promise<UserProfile[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT id, username, email, created_at, last_login, status FROM users ORDER BY last_login DESC NULLS LAST'
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getUserStats(): Promise<{
        total: number;
        online: number;
        away: number;
        offline: number;
        recentlyActive: number;
    }> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online,
                    SUM(CASE WHEN status = 'away' THEN 1 ELSE 0 END) as away,
                    SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline,
                    SUM(CASE 
                        WHEN last_login IS NOT NULL 
                        AND last_login > NOW() - INTERVAL '24 hours' 
                        THEN 1 ELSE 0 END) as recentlyActive
                FROM users
            `);
            
            const row = result.rows[0];
            return {
                total: parseInt(row.total) || 0,
                online: parseInt(row.online) || 0,
                away: parseInt(row.away) || 0,
                offline: parseInt(row.offline) || 0,
                recentlyActive: parseInt(row.recentlyactive) || 0
            };
        } finally {
            client.release();
        }
    }

    async getUsersByStatus(status: string): Promise<UserProfile[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT id, username, email, created_at, last_login, status FROM users WHERE status = $1 ORDER BY last_login DESC NULLS LAST',
                [status]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getRecentlyActiveUsers(hours: number = 24): Promise<UserProfile[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT id, username, email, created_at, last_login, status FROM users WHERE last_login IS NOT NULL AND last_login > NOW() - INTERVAL \'$1 hours\' ORDER BY last_login DESC',
                [hours]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}

// Factory para crear la instancia correcta de base de datos
export function createDatabaseService(): DatabaseService {
    return databaseConfig.isProduction ? new PostgreSQLService() : new SQLiteService();
}

// Instancia global de la base de datos
export const dbService = createDatabaseService();

// Funciones de conveniencia para usar la instancia global
export async function initDatabase(): Promise<void> {
    await dbService.init();
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    return await dbService.createUser(userData);
}

export async function findUserByUsername(username: string): Promise<User | null> {
    return await dbService.findUserByUsername(username);
}

export async function findUserByEmail(email: string): Promise<User | null> {
    return await dbService.findUserByEmail(email);
}

export async function updateUserStatus(userId: number, status: string): Promise<void> {
    await dbService.updateUserStatus(userId, status);
}

export async function getAllUsers(): Promise<UserProfile[]> {
    return await dbService.getAllUsers();
}

export async function getUserStats(): Promise<{
    total: number;
    online: number;
    away: number;
    offline: number;
    recentlyActive: number;
}> {
    return await dbService.getUserStats();
}

export async function getUsersByStatus(status: string): Promise<UserProfile[]> {
    return await dbService.getUsersByStatus(status);
}

export async function getRecentlyActiveUsers(hours?: number): Promise<UserProfile[]> {
    return await dbService.getRecentlyActiveUsers(hours);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await dbService.verifyPassword(password, hashedPassword);
} 