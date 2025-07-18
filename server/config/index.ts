import { ServerConfig, DatabaseConfig } from '../types/index.js';

// Configuración del servidor
export const serverConfig: ServerConfig = {
    port: parseInt(process.env.PORT || '3001'),
    corsOrigins: [
        "http://localhost:5173",
        "https://tic-tac-toe-ai-ochre.vercel.app",
        "https://tic-tac-toe-ai-santiagopazos925.vercel.app",
        process.env.FRONTEND_URL
    ].filter(Boolean) as string[],
    jwtSecret: process.env.JWT_SECRET || 'tu-secreto-super-seguro',
    environment: process.env.NODE_ENV || 'development'
};

// Configuración de la base de datos
export const databaseConfig: DatabaseConfig = {
    isProduction: process.env.NODE_ENV === 'production',
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
};

// Configuración de CORS
export const corsOptions = {
    origin: serverConfig.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

// Configuración de Socket.IO
export const socketConfig = {
    cors: {
        origin: serverConfig.corsOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
};

// Configuración de JWT
export const jwtConfig = {
    secret: serverConfig.jwtSecret,
    expiresIn: '24h' as const
};

// Configuración de validación
export const validationConfig = {
    password: {
        minLength: 6
    },
    username: {
        minLength: 3,
        maxLength: 20
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

// Configuración del lobby
export const lobbyConfig = {
    reconnectionTimeout: 10000, // 10 segundos
    maxChatHistory: 100, // Máximo 100 mensajes en el historial
    pingInterval: 5000 // Ping cada 5 segundos
}; 