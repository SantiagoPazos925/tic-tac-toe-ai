// Handlers específicos para Tic-Tac-Toe

import { Server, Socket } from 'socket.io';
import { TicTacToeRoom, TicTacToeMove } from './types.js';
import {
    checkWinner,
    createTicTacToeRoom,
    addPlayerToRoom,
    makeMove,
    restartGame
} from './utils.js';

// Almacenar las salas de Tic-Tac-Toe
const ticTacToeRooms = new Map<string, TicTacToeRoom>();

export function setupTicTacToeHandlers(io: Server, socket: Socket) {
    // Evento para obtener la lista de salas en tiempo real
    socket.on('getRooms', () => {
        const rooms = Array.from(ticTacToeRooms.values()).map(room => ({
            id: room.id,
            players: room.players.length,
            gameStarted: room.gameStarted
        }));
        socket.emit('roomsList', rooms);
    });

    // Unirse a una sala
    socket.on('joinRoom', (data: { roomId: string, playerName: string }) => {
        const { roomId, playerName } = data;
        socket.join(roomId);

        let isNewRoom = false;
        if (!ticTacToeRooms.has(roomId)) {
            // Crear nueva sala
            const newRoom = createTicTacToeRoom(roomId, socket.id, playerName);
            ticTacToeRooms.set(roomId, newRoom);
            isNewRoom = true;
            socket.emit('playerJoined', { playerNumber: 1, symbol: 'X' });
        } else {
            const room = ticTacToeRooms.get(roomId)!;
            const success = addPlayerToRoom(room, socket.id, playerName);

            if (success) {
                socket.emit('playerJoined', { playerNumber: 2, symbol: 'O' });

                // Notificar a ambos jugadores que el juego comenzó
                io.to(roomId).emit('gameStarted', {
                    board: room.board,
                    currentPlayer: room.currentPlayer,
                    playerNames: {
                        player1: room.playerNames.get(room.players[0]) || 'Jugador 1',
                        player2: room.playerNames.get(room.players[1]) || 'Jugador 2'
                    }
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
    socket.on('makeMove', ({ roomId, index }: TicTacToeMove) => {
        const room = ticTacToeRooms.get(roomId);
        if (!room || !room.gameStarted) return;

        const success = makeMove(room, socket.id, index);
        if (!success) return;

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
            // Enviar actualización a todos los jugadores
            const playerIndex = room.players.indexOf(socket.id);
            const symbol = playerIndex === 0 ? 'X' : 'O';

            io.to(roomId).emit('moveMade', {
                board: room.board,
                currentPlayer: room.currentPlayer,
                lastMove: { index, symbol },
                playerNames: {
                    player1: room.playerNames.get(room.players[0]) || 'Jugador 1',
                    player2: room.playerNames.get(room.players[1]) || 'Jugador 2'
                }
            });
        }
    });

    // Reiniciar juego
    socket.on('restartGame', (roomId: string) => {
        const room = ticTacToeRooms.get(roomId);
        if (room) {
            restartGame(room);

            io.to(roomId).emit('gameRestarted', {
                board: room.board,
                currentPlayer: room.currentPlayer,
                playerNames: {
                    player1: room.playerNames.get(room.players[0]) || 'Jugador 1',
                    player2: room.playerNames.get(room.players[1]) || 'Jugador 2'
                }
            });
        }
    });

    // Evento para salir de una sala
    socket.on('leaveRoom', (roomId: string) => {
        const room = ticTacToeRooms.get(roomId);
        if (room) {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                if (room.players.length === 0) {
                    ticTacToeRooms.delete(roomId);
                    io.emit('roomsUpdated');
                } else {
                    io.to(roomId).emit('playerDisconnected');
                    io.emit('roomsUpdated');
                }
            }
        }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        for (const [roomId, room] of ticTacToeRooms.entries()) {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);

                if (room.players.length === 0) {
                    // Eliminar sala vacía
                    ticTacToeRooms.delete(roomId);
                    io.emit('roomsUpdated');
                } else {
                    // Notificar al otro jugador
                    io.to(roomId).emit('playerDisconnected');
                    io.emit('roomsUpdated');
                }
                break;
            }
        }
    });
}

// Función para obtener las salas de Tic-Tac-Toe
export function getTicTacToeRooms() {
    return ticTacToeRooms;
} 