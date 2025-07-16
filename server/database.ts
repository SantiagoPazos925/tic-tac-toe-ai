import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

// Interfaces
export interface User {
    id?: number;
    username: string;
    email: string;
    password_hash: string;
    created_at?: Date;
    last_login?: Date;
    status?: 'online' | 'away' | 'offline';
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    created_at: Date;
    last_login: Date;
    status: string;
}

// Configuración de base de datos
const isProduction = process.env.NODE_ENV === 'production';
let db: Database | Pool;

// Inicializar base de datos
export async function initDatabase() {
    if (isProduction) {
        // PostgreSQL para Railway
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        db = pool;

        // Crear tablas si no existen
        await createTablesPostgreSQL(pool);
        console.log('✅ Base de datos PostgreSQL conectada');
    } else {
        // SQLite para desarrollo local
        db = await open({
            filename: './users.db',
            driver: sqlite3.Database
        });

        // Crear tablas si no existen
        await createTablesSQLite(db);
        console.log('✅ Base de datos SQLite conectada');
    }
}

// Crear tablas en SQLite
async function createTablesSQLite(db: Database) {
    await db.exec(`
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

// Crear tablas en PostgreSQL
async function createTablesPostgreSQL(pool: Pool) {
    const client = await pool.connect();
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

// Funciones de usuario
export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password_hash, 10);

    if (isProduction) {
        const pool = db as Pool;
        const client = await pool.connect();
        try {
            const result = await client.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
                [userData.username, userData.email, hashedPassword]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    } else {
        const sqliteDb = db as Database;
        const result = await sqliteDb.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [userData.username, userData.email, hashedPassword]
        );

        return {
            id: result.lastID,
            username: userData.username,
            email: userData.email,
            password_hash: hashedPassword,
            created_at: new Date(),
            status: 'offline'
        };
    }
}

export async function findUserByUsername(username: string): Promise<User | null> {
    if (isProduction) {
        const pool = db as Pool;
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    } else {
        const sqliteDb = db as Database;
        const result = await sqliteDb.get('SELECT * FROM users WHERE username = ?', [username]);
        return result || null;
    }
}

export async function findUserByEmail(email: string): Promise<User | null> {
    if (isProduction) {
        const pool = db as Pool;
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    } else {
        const sqliteDb = db as Database;
        const result = await sqliteDb.get('SELECT * FROM users WHERE email = ?', [email]);
        return result || null;
    }
}

export async function updateUserStatus(userId: number, status: string): Promise<void> {
    if (isProduction) {
        const pool = db as Pool;
        const client = await pool.connect();
        try {
            await client.query(
                'UPDATE users SET status = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2',
                [status, userId]
            );
        } finally {
            client.release();
        }
    } else {
        const sqliteDb = db as Database;
        await sqliteDb.run(
            'UPDATE users SET status = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [status, userId]
        );
    }
}

export async function getAllUsers(): Promise<UserProfile[]> {
    if (isProduction) {
        const pool = db as Pool;
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT id, username, email, created_at, last_login, status FROM users ORDER BY last_login DESC'
            );
            return result.rows;
        } finally {
            client.release();
        }
    } else {
        const sqliteDb = db as Database;
        const result = await sqliteDb.all(
            'SELECT id, username, email, created_at, last_login, status FROM users ORDER BY last_login DESC'
        );
        return result;
    }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
} 