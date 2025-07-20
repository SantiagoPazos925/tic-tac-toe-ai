import bcrypt from 'bcryptjs';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { databaseConfig } from '../config/index.js';
import { User, UserProfile } from '../types/index.js';
import { Logger } from '../utils/logger.js';

// Clase abstracta para operaciones de base de datos
abstract class DatabaseService {
    abstract init(): Promise<void>;
    abstract createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User>;
    abstract findUserByUsername(username: string): Promise<User | null>;
    abstract findUserByEmail(email: string): Promise<User | null>;
    abstract updateUserStatus(userId: number, status: string): Promise<void>;
    abstract getAllUsers(): Promise<UserProfile[]>;
    abstract verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}

// Implementación para SQLite
class SQLiteService extends DatabaseService {
    private db!: Database;

    async init(): Promise<void> {
        this.db = await open({
            filename: './users.db',
            driver: sqlite3.Database
        });

        await this.createTables();
        Logger.database('Base de datos SQLite inicializada');
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
    }

    async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password_hash, 10);

        const result = await this.db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [userData.username, userData.email, hashedPassword]
        );

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
    }

    async getAllUsers(): Promise<UserProfile[]> {
        return await this.db.all(
            'SELECT id, username, email, created_at, last_login, status FROM users ORDER BY last_login DESC'
        );
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
                'SELECT id, username, email, created_at, last_login, status FROM users ORDER BY last_login DESC'
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

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await dbService.verifyPassword(password, hashedPassword);
} 