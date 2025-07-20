import { DatabaseConfig, ServerConfig } from '../types/index.js';

// Configuración del servidor
export const serverConfig: ServerConfig = {
    port: parseInt(process.env['PORT'] || '3001'),
    corsOrigins: [
        "http://localhost:3000",
        "https://tic-tac-toe-ai-ochre.vercel.app",
        "https://tic-tac-toe-ai-santiagopazos925.vercel.app",
        process.env['FRONTEND_URL']
    ].filter(Boolean) as string[],
    jwtSecret: process.env['JWT_SECRET'] || 'tu-secreto-super-seguro',
    environment: process.env['NODE_ENV'] || 'development'
};

// Configuración de la base de datos
export const databaseConfig: DatabaseConfig = {
    isProduction: process.env['NODE_ENV'] === 'production',
    connectionString: process.env['DATABASE_URL'] || '',
    ssl: process.env['NODE_ENV'] === 'production'
};

// Configuración de CORS
export const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Permitir requests sin origin (como aplicaciones móviles o Postman)
        if (!origin) return callback(null, true);
        
        // En desarrollo, permitir cualquier origin localhost
        if (serverConfig.environment === 'development' && origin.includes('localhost')) {
            return callback(null, true);
        }
        
        // En producción, verificar contra la lista de origins permitidos
        if (serverConfig.corsOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204
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