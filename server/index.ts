import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Almacenar las salas de juego
interface GameRoom {
    id: string;
    players: string[];
    board: string[];
    currentPlayer: string;
    gameStarted: boolean;
}

const gameRooms = new Map<string, GameRoom>();

// Función para verificar si hay un ganador
function checkWinner(board: string[]): string | null {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticales
        [0, 4, 8], [2, 4, 6] // diagonales
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    // Verificar empate
    if (board.every(cell => cell !== null)) {
        return 'tie';
    }

    return null;
}

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Manejar ping para medir latencia
    socket.on('ping', () => {
        socket.emit('pong');
    });

    // Evento para obtener la lista de salas en tiempo real
    socket.on('getRooms', () => {
        const rooms = Array.from(gameRooms.values()).map(room => ({
            id: room.id,
            players: room.players.length,
            gameStarted: room.gameStarted
        }));
        socket.emit('roomsList', rooms);
    });

    // Unirse a una sala
    socket.on('joinRoom', (roomId: string) => {
        socket.join(roomId);

        let isNewRoom = false;
        if (!gameRooms.has(roomId)) {
            // Crear nueva sala
            gameRooms.set(roomId, {
                id: roomId,
                players: [socket.id],
                board: Array(9).fill(null),
                currentPlayer: socket.id,
                gameStarted: false
            });
            isNewRoom = true;
            socket.emit('playerJoined', { playerNumber: 1, symbol: 'X' });
        } else {
            const room = gameRooms.get(roomId)!;
            if (room.players.length < 2) {
                // Segundo jugador se une
                room.players.push(socket.id);
                room.gameStarted = true;
                socket.emit('playerJoined', { playerNumber: 2, symbol: 'O' });

                // Notificar a ambos jugadores que el juego comenzó
                io.to(roomId).emit('gameStarted', {
                    board: room.board,
                    currentPlayer: room.currentPlayer
                });
            } else {
                // Sala llena
                socket.emit('roomFull');
            }
        }
        // Notificar a todos los clientes que la lista de salas cambió
        if (isNewRoom) {
            io.emit('roomsUpdated');
        }
    });

    // Hacer un movimiento
    socket.on('makeMove', ({ roomId, index }: { roomId: string, index: number }) => {
        const room = gameRooms.get(roomId);
        if (!room || !room.gameStarted) return;

        // Verificar que es el turno del jugador
        if (room.currentPlayer !== socket.id) return;

        // Verificar que la celda está vacía
        if (room.board[index] !== null) return;

        // Determinar el símbolo del jugador
        const playerIndex = room.players.indexOf(socket.id);
        const symbol = playerIndex === 0 ? 'X' : 'O';

        // Hacer el movimiento
        room.board[index] = symbol;

        // Verificar si hay un ganador
        const winner = checkWinner(room.board);

        if (winner) {
            // Juego terminado
            io.to(roomId).emit('gameOver', {
                board: room.board,
                winner: winner === 'tie' ? null : winner,
                isTie: winner === 'tie'
            });
        } else {
            // Cambiar turno
            room.currentPlayer = room.players[(playerIndex + 1) % 2];

            // Enviar actualización a todos los jugadores
            io.to(roomId).emit('moveMade', {
                board: room.board,
                currentPlayer: room.currentPlayer,
                lastMove: { index, symbol }
            });
        }
    });

    // Reiniciar juego
    socket.on('restartGame', (roomId: string) => {
        const room = gameRooms.get(roomId);
        if (room) {
            room.board = Array(9).fill(null);
            room.currentPlayer = room.players[0];
            room.gameStarted = true;

            io.to(roomId).emit('gameRestarted', {
                board: room.board,
                currentPlayer: room.currentPlayer
            });
        }
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);

        for (const [roomId, room] of gameRooms.entries()) {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);

                if (room.players.length === 0) {
                    // Eliminar sala vacía
                    gameRooms.delete(roomId);
                    // Notificar a todos los clientes que la lista de salas cambió
                    io.emit('roomsUpdated');
                } else {
                    // Notificar al otro jugador
                    io.to(roomId).emit('playerDisconnected');
                    // Notificar a todos los clientes que la lista de salas cambió
                    io.emit('roomsUpdated');
                }
                break;
            }
        }
    });
});

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Socket.io disponible en http://localhost:${PORT}`);
}); 