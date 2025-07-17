import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase, getAllUsers, updateUserStatus } from './database.js';
import authRoutes from './auth.js';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
    "http://localhost:5173",
    "https://tic-tac-toe-ai-ochre.vercel.app",
    "https://tic-tac-toe-ai-santiagopazos925.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Inicializar base de datos
initDatabase().catch(console.error);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Almacenar usuarios conectados (para el lobby en tiempo real)
interface LobbyUser {
    id: string;
    name: string;
    status: 'online' | 'away' | 'offline';
    joinedAt: Date;
}

// Almacenar mensajes del chat
interface ChatMessage {
    id: string;
    type: 'user' | 'system';
    content: string;
    sender?: string;
    timestamp: Date;
}

const connectedUsers = new Map<string, LobbyUser>();
const chatMessages: ChatMessage[] = [];

// Health check para Railway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'Connected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'Template Backend funcionando correctamente',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL on Railway'
    });
});

// Ruta para obtener usuarios registrados
app.get('/api/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json({ users });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta de ejemplo
app.get('/api/hello', (req, res) => {
    res.json({
        message: '¡Hola desde el backend!',
        timestamp: new Date().toISOString()
    });
});

// Socket.io events
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Unirse al lobby
    socket.on('join-lobby', (userData: { name: string }) => {
        const user: LobbyUser = {
            id: socket.id,
            name: userData.name,
            status: 'online',
            joinedAt: new Date()
        };

        connectedUsers.set(socket.id, user);

        // Crear mensaje del sistema
        const systemMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `${userData.name} se unió al lobby`,
            timestamp: new Date()
        };
        chatMessages.push(systemMessage);

        // Notificar a todos los usuarios sobre el nuevo usuario
        io.emit('user-joined', user);

        // Enviar mensaje del sistema a todos
        io.emit('chat-message', systemMessage);

        // Enviar lista actual de usuarios al nuevo usuario
        socket.emit('users-list', Array.from(connectedUsers.values()));

        // Enviar historial del chat al nuevo usuario
        socket.emit('chat-history', chatMessages);

        console.log(`Usuario ${userData.name} se unió al lobby`);
    });

    // Enviar mensaje del chat
    socket.on('send-message', (messageData: { content: string }) => {
        const user = connectedUsers.get(socket.id);
        if (user && messageData.content.trim()) {
            const chatMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'user',
                content: messageData.content.trim(),
                sender: user.name,
                timestamp: new Date()
            };

            chatMessages.push(chatMessage);

            // Enviar mensaje a todos los usuarios
            io.emit('chat-message', chatMessage);

            console.log(`Mensaje de ${user.name}: ${messageData.content}`);
        }
    });

    // Cambiar estado del usuario
    socket.on('update-status', (status: 'online' | 'away') => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            user.status = status;
            connectedUsers.set(socket.id, user);
            io.emit('user-updated', user);
        }
    });

    // Salir del lobby manualmente
    socket.on('leave-lobby', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            connectedUsers.delete(socket.id);

            // Crear mensaje del sistema
            const systemMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'system',
                content: `${user.name} cerró sesión`,
                timestamp: new Date()
            };
            chatMessages.push(systemMessage);

            io.emit('user-left', { id: socket.id, name: user.name });
            io.emit('chat-message', systemMessage);

            console.log(`Usuario ${user.name} cerró sesión`);
        }
    });

    // Ping para mantener conexión
    socket.on('ping', () => {
        socket.emit('pong');
    });

    // Desconexión
    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            connectedUsers.delete(socket.id);

            // Crear mensaje del sistema
            const systemMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'system',
                content: `${user.name} se desconectó`,
                timestamp: new Date()
            };
            chatMessages.push(systemMessage);

            io.emit('user-left', { id: socket.id, name: user.name });
            io.emit('chat-message', systemMessage);

            console.log(`Usuario ${user.name} se desconectó`);
        }
    });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`👥 Lobby activo en: http://localhost:${PORT}`);
    console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
    console.log(`🗄️ Database: ${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'SQLite'}`);
}); 