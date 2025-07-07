import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar handlers de cada juego
import { setupTicTacToeHandlers } from './games/tic-tac-toe/handlers.js';
import { setupWordGuessingHandlers } from './games/word-guessing/handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://tic-tac-toe-ai-ochre.vercel.app",
            ...(process.env.RAILWAY_PUBLIC_DOMAIN ? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`] : [])
        ],
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint para Railway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta para servir el frontend (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Manejar ping para medir latencia
    socket.on('ping', () => {
        socket.emit('pong');
    });

    // Configurar handlers de cada juego
    setupTicTacToeHandlers(io, socket);
    setupWordGuessingHandlers(io, socket);
});

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Socket.io disponible en http://localhost:${PORT}`);
}); 