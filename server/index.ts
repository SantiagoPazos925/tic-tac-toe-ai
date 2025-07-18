import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Configuración
import {
    serverConfig,
    corsOptions,
    socketConfig
} from './config/index.js';

// Servicios
import { initDatabase } from './services/database.js';
import { SocketService } from './services/socket.js';

// Rutas
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// Middleware
import {
    requestLogger,
    errorHandler
} from './middleware/auth.js';

// Utilidades
import { Logger } from './utils/logger.js';

// Crear aplicación Express
const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, socketConfig);

// Inicializar servicios
const socketService = new SocketService(io);

// Middleware global
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Inicializar base de datos
initDatabase().catch((error) => {
    Logger.error('Error inicializando base de datos', error);
    process.exit(1);
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check para Railway
app.get('/health', (req, res) => {
    const stats = socketService.getLobbyStats();

    res.status(200).json({
        success: true,
        data: {
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected',
            environment: serverConfig.environment,
            lobby: stats
        }
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'Template Backend funcionando correctamente',
            timestamp: new Date().toISOString(),
            database: serverConfig.environment === 'production' ? 'PostgreSQL on Railway' : 'SQLite',
            version: '1.0.0'
        }
    });
});

// Ruta de ejemplo
app.get('/api/hello', (req, res) => {
    res.json({
        success: true,
        data: {
            message: '¡Hola desde el backend!',
            timestamp: new Date().toISOString()
        }
    });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Limpiar sesiones antiguas periódicamente
setInterval(() => {
    socketService.cleanupOldSessions();
}, 5 * 60 * 1000); // Cada 5 minutos

// Iniciar servidor
httpServer.listen(serverConfig.port, () => {
    Logger.info(`🚀 Servidor corriendo en puerto ${serverConfig.port}`);
    Logger.info(`📊 Health check: http://localhost:${serverConfig.port}/health`);
    Logger.info(`👥 Lobby activo en: http://localhost:${serverConfig.port}`);
    Logger.info(`🔐 Auth routes: http://localhost:${serverConfig.port}/api/auth`);
    Logger.info(`👤 User routes: http://localhost:${serverConfig.port}/api/users`);
    Logger.info(`🗄️ Database: ${serverConfig.environment === 'production' ? 'PostgreSQL' : 'SQLite'}`);
    Logger.info(`🌍 Environment: ${serverConfig.environment}`);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    Logger.info('SIGTERM recibido, cerrando servidor...');
    httpServer.close(() => {
        Logger.info('Servidor cerrado');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    Logger.info('SIGINT recibido, cerrando servidor...');
    httpServer.close(() => {
        Logger.info('Servidor cerrado');
        process.exit(0);
    });
}); 