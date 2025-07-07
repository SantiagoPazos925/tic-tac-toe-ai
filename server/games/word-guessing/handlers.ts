// Handlers específicos para Word Guessing

import { Server, Socket } from 'socket.io';
import {
    WordGuessingRoom,
    WordGuessingPlayer,
    WordGuessingMove,
    WordGuessingMessage,
    WordGuessingStart,
    WordGuessingJoin
} from './types.js';
import {
    initializeGameState,
    startNewRound,
    endRound,
    endGame,
    createWordGuessingMessage,
    checkGuess,
    isGameOver,
    getHiddenWordDisplay,
    getNextDrawer
} from './utils.js';

// Almacenar las salas de Word Guessing
const wordGuessingRooms = new Map<string, WordGuessingRoom>();

// Almacenar temporizadores de reconexión
const reconnectionTimers = new Map<string, NodeJS.Timeout>();

// Configuración: cada cuántos segundos se revela una letra (puedes cambiar este valor)
const LETTER_REVEAL_INTERVAL = 15; // segundos

let globalIO: Server | null = null;

// Mapa para asociar socket.id a userId
const socketIdToUserId = new Map<string, string>();

export function setupWordGuessingHandlers(io: Server, socket: Socket) {
    if (!globalIO) globalIO = io;

    // Evento para obtener la lista de salas de Word Guessing
    socket.on('getWordGuessingRooms', () => {
        const rooms = getFilteredRoomsList();
        socket.emit('wordGuessingRoomsList', rooms);
    });

    // Unirse a una sala de Word Guessing
    socket.on('join-word-guessing-room', (data: { roomId: string, playerName: string, userId: string }) => {
        const { roomId, playerName, userId } = data;
        socket.join(roomId);
        socketIdToUserId.set(socket.id, userId);

        let isNewRoom = false;
        let joinedPlayer: any = null;
        if (!wordGuessingRooms.has(roomId)) {
            // Crear nueva sala
            const newPlayer: WordGuessingPlayer = {
                id: userId,
                name: playerName,
                isDrawing: false,
                score: 0,
                hasGuessed: false
            };

            const room: WordGuessingRoom = {
                id: roomId,
                players: [newPlayer],
                gameState: initializeGameState([newPlayer]),
                drawingData: [],
                messages: [],
                timers: new Map(),
                creatorName: playerName,
                playerOrder: [userId] // nuevo campo para el orden
            };

            wordGuessingRooms.set(roomId, room);
            isNewRoom = true;

            // Notificar al jugador que se unió
            socket.emit('word-guessing-player-joined', newPlayer);
            joinedPlayer = newPlayer;

            // Notificar a todos los clientes que la lista de salas cambió (siempre, no solo si isNewRoom)
            io.emit('wordGuessingRoomsList', getFilteredRoomsList());
        } else {
            const room = wordGuessingRooms.get(roomId)!;

            // Buscar por userId
            const existingPlayer = room.players.find(p => p.id === userId);
            if (existingPlayer) {
                socket.emit('word-guessing-player-joined', existingPlayer);
                joinedPlayer = existingPlayer;
            } else {
                const newPlayer: WordGuessingPlayer = {
                    id: userId,
                    name: playerName,
                    isDrawing: false,
                    score: 0,
                    hasGuessed: false
                };

                room.players.push(newPlayer);
                room.gameState.players = room.players;
                room.playerOrder.push(userId); // mantener el orden

                // Notificar al jugador que se unió
                socket.emit('word-guessing-player-joined', newPlayer);
                joinedPlayer = newPlayer;
            }
        }

        // Notificar a todos los jugadores en la sala
        const room = wordGuessingRooms.get(roomId)!;
        io.to(roomId).emit('word-guessing-game-state', room.gameState);

        // Mensaje de sistema al chat
        if (joinedPlayer) {
            const systemMessage = {
                id: Date.now().toString() + Math.random().toString(36).substring(2),
                playerId: 'system',
                playerName: 'Sistema',
                message: `${joinedPlayer.name} se unió a la partida`,
                timestamp: Date.now(),
                isCorrectGuess: false
            };
            room.messages.push(systemMessage);
            room.gameState.messages = [...room.messages];
            io.to(roomId).emit('word-guessing-message', systemMessage);
        }

        // Notificar a todos los clientes que la lista de salas cambió
        if (isNewRoom) {
            io.emit('wordGuessingRoomsList', getFilteredRoomsList());
        }
    });

    // Iniciar juego de Word Guessing
    socket.on('word-guessing-start', (data: WordGuessingStart) => {
        const { roomId } = data;
        const room = wordGuessingRooms.get(roomId);

        if (!room || room.players.length < 2) return;

        // Inicializar el juego
        const gameState = initializeGameState(room.players);
        room.gameState = gameState;

        // Iniciar la primera ronda
        const roundData = startNewRound(room.players, 1);
        Object.assign(room.gameState, roundData);

        // Sincronizar room.players con gameState.players
        room.players = room.gameState.players;

        // Notificar a todos los jugadores
        io.to(roomId).emit('word-guessing-game-state', room.gameState);
        io.to(roomId).emit('word-guessing-round-start', {
            word: room.gameState.currentWord,
            drawer: room.gameState.currentDrawer,
            timeRemaining: room.gameState.timeRemaining
        });

        // Iniciar temporizador
        startWordGuessingTimer(roomId, room, io);
    });

    // Enviar mensaje de chat
    socket.on('word-guessing-message', (data: { roomId: string, message: string, userId: string }) => {
        const { roomId, message, userId } = data;
        const room = wordGuessingRooms.get(roomId);

        if (!room) return;

        const player = room.players.find(p => p.id === userId);
        if (!player) return;

        // Verificar si es una respuesta correcta
        const isCorrectGuess = checkGuess(message, room.gameState.currentWord);

        const chatMessage = createWordGuessingMessage(
            userId,
            player.name,
            message,
            isCorrectGuess
        );

        room.messages.push(chatMessage);
        room.gameState.messages = [...room.messages];

        // Si es correcta, marcar al jugador como que adivinó
        if (isCorrectGuess && !player.hasGuessed) {
            player.hasGuessed = true;
            room.gameState.correctGuesses.push(player.name);
        }

        // Notificar a todos los jugadores
        io.to(roomId).emit('word-guessing-message', chatMessage);
        io.to(roomId).emit('word-guessing-game-state', room.gameState);

        // Si todos adivinaron o se acabó el tiempo, terminar la ronda
        const allGuessed = room.players
            .filter(p => !p.isDrawing)
            .every(p => p.hasGuessed);

        if (allGuessed) {
            endWordGuessingRound(roomId, room, io);
        }
    });

    // Enviar datos de dibujo
    socket.on('word-guessing-draw', (data: WordGuessingMove) => {
        const { roomId, drawingPoint } = data;
        const room = wordGuessingRooms.get(roomId);

        if (!room) return;

        const player = room.players.find(p => p.id === drawingPoint.userId);
        if (!player || !player.isDrawing) return;

        room.drawingData.push(drawingPoint);
        room.gameState.drawingData = room.drawingData;

        // Notificar a todos los jugadores
        io.to(roomId).emit('word-guessing-drawing-update', room.drawingData);
    });

    // Limpiar canvas
    socket.on('word-guessing-clear', (data: { roomId: string, userId: string }) => {
        const { roomId, userId } = data;
        const room = wordGuessingRooms.get(roomId);

        if (!room) return;

        const player = room.players.find(p => p.id === userId);
        if (!player || !player.isDrawing) return;

        room.drawingData = [];
        room.gameState.drawingData = [];

        io.to(roomId).emit('word-guessing-canvas-cleared');
        io.to(roomId).emit('word-guessing-drawing-update', []);
    });

    // Actualizar el dibujo completo (para deshacer/rehacer)
    socket.on('word-guessing-drawing-update', (data: { roomId: string, drawingData: any[], userId: string }) => {
        const { roomId, drawingData, userId } = data;
        const room = wordGuessingRooms.get(roomId);
        if (!room) return;

        // Solo el dibujante puede modificar el dibujo
        const player = room.players.find(p => p.id === userId);
        if (!player || !player.isDrawing) return;

        room.drawingData = drawingData;
        room.gameState.drawingData = drawingData;

        io.to(roomId).emit('word-guessing-drawing-update', drawingData);
    });

    // Evento para salir de una sala
    socket.on('leave-word-guessing-room', (roomId: string, userId: string) => {
        const room = wordGuessingRooms.get(roomId);
        if (room) {
            const playerIndex = room.players.findIndex(p => p.id === userId);
            if (playerIndex !== -1) {
                const playerName = room.players[playerIndex].name;
                room.players.splice(playerIndex, 1);
                room.gameState.players = room.players;
                // Eliminar del orden
                if (room.playerOrder) {
                    room.playerOrder = room.playerOrder.filter(id => id !== userId);
                }

                // Mensaje de sistema al chat
                const systemMessage = {
                    id: Date.now().toString() + Math.random().toString(36).substring(2),
                    playerId: 'system',
                    playerName: 'Sistema',
                    message: `${playerName} abandonó la partida`,
                    timestamp: Date.now(),
                    isCorrectGuess: false
                };
                room.messages.push(systemMessage);
                room.gameState.messages = [...room.messages];
                io.to(roomId).emit('word-guessing-message', systemMessage);

                if (room.players.length === 0) {
                    wordGuessingRooms.delete(roomId);
                    io.emit('wordGuessingRoomsList', getFilteredRoomsList());
                } else {
                    // Si el dibujante se desconectó, esperar 30 segundos para reconexión
                    if (room.gameState.currentDrawer === userId) {
                        // Cancelar temporizador existente si hay uno
                        if (reconnectionTimers.has(roomId)) {
                            clearTimeout(reconnectionTimers.get(roomId)!);
                        }

                        // Notificar a todos que el dibujante se desconectó
                        io.to(roomId).emit('word-guessing-drawer-disconnected', {
                            previousDrawer: userId,
                            timeToReconnect: 30
                        });

                        // Iniciar temporizador de 30 segundos para reconexión
                        const timer = setTimeout(() => {
                            const currentRoom = wordGuessingRooms.get(roomId);
                            if (currentRoom && currentRoom.gameState.currentDrawer === userId) {
                                // Si después de 30 segundos el dibujante no se reconectó, asignar nuevo dibujante
                                const nextDrawer = getNextDrawer(currentRoom.players, userId);
                                currentRoom.gameState.currentDrawer = nextDrawer;
                                currentRoom.gameState.players = currentRoom.players.map(p => ({
                                    ...p,
                                    isDrawing: p.id === nextDrawer
                                }));

                                // Notificar cambio de dibujante
                                io.to(roomId).emit('word-guessing-drawer-changed', {
                                    newDrawer: nextDrawer
                                });
                                io.to(roomId).emit('word-guessing-game-state', currentRoom.gameState);
                            }
                            reconnectionTimers.delete(roomId);
                        }, 30000); // 30 segundos

                        reconnectionTimers.set(roomId, timer);
                    } else {
                        // Si el jugador que se reconectó era el dibujante, cancelar temporizador
                        if (reconnectionTimers.has(roomId)) {
                            clearTimeout(reconnectionTimers.get(roomId)!);
                            reconnectionTimers.delete(roomId);
                            io.to(roomId).emit('word-guessing-drawer-reconnected', { drawerId: userId });
                        }
                    }

                    io.to(roomId).emit('word-guessing-player-left', userId);
                    io.to(roomId).emit('word-guessing-game-state', room.gameState);
                    io.emit('wordGuessingRoomsList', getFilteredRoomsList());
                }
            }
        }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        const userId = socketIdToUserId.get(socket.id);
        for (const [roomId, room] of wordGuessingRooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === userId);
            if (playerIndex !== -1) {
                const playerName = room.players[playerIndex].name;
                room.players.splice(playerIndex, 1);
                room.gameState.players = room.players;
                // Eliminar del orden
                if (room.playerOrder) {
                    room.playerOrder = room.playerOrder.filter(id => id !== userId);
                }

                // Mensaje de sistema al chat
                const systemMessage = {
                    id: Date.now().toString() + Math.random().toString(36).substring(2),
                    playerId: 'system',
                    playerName: 'Sistema',
                    message: `${playerName} abandonó la partida`,
                    timestamp: Date.now(),
                    isCorrectGuess: false
                };
                room.messages.push(systemMessage);
                room.gameState.messages = [...room.messages];
                io.to(roomId).emit('word-guessing-message', systemMessage);

                if (room.players.length === 0) {
                    // Eliminar sala vacía
                    wordGuessingRooms.delete(roomId);
                    io.emit('wordGuessingRoomsList', getFilteredRoomsList());
                } else {
                    // Si el dibujante se desconectó, esperar 30 segundos para reconexión
                    if (room.gameState.currentDrawer === userId) {
                        // Cancelar temporizador existente si hay uno
                        if (reconnectionTimers.has(roomId)) {
                            clearTimeout(reconnectionTimers.get(roomId)!);
                        }

                        // Notificar a todos que el dibujante se desconectó
                        io.to(roomId).emit('word-guessing-drawer-disconnected', {
                            previousDrawer: userId,
                            timeToReconnect: 30
                        });

                        // Iniciar temporizador de 30 segundos para reconexión
                        const timer = setTimeout(() => {
                            const currentRoom = wordGuessingRooms.get(roomId);
                            if (currentRoom && currentRoom.gameState.currentDrawer === userId) {
                                // Si después de 30 segundos el dibujante no se reconectó, asignar nuevo dibujante
                                const nextDrawer = getNextDrawer(currentRoom.players, userId);
                                currentRoom.gameState.currentDrawer = nextDrawer;
                                currentRoom.gameState.players = currentRoom.players.map(p => ({
                                    ...p,
                                    isDrawing: p.id === nextDrawer
                                }));

                                // Notificar cambio de dibujante
                                io.to(roomId).emit('word-guessing-drawer-changed', {
                                    newDrawer: nextDrawer
                                });
                                io.to(roomId).emit('word-guessing-game-state', currentRoom.gameState);
                            }
                            reconnectionTimers.delete(roomId);
                        }, 30000); // 30 segundos

                        reconnectionTimers.set(roomId, timer);
                    } else {
                        // Si el jugador que se reconectó era el dibujante, cancelar temporizador
                        if (reconnectionTimers.has(roomId)) {
                            clearTimeout(reconnectionTimers.get(roomId)!);
                            reconnectionTimers.delete(roomId);
                            io.to(roomId).emit('word-guessing-drawer-reconnected', { drawerId: userId });
                        }
                    }

                    // Notificar a los demás jugadores
                    io.to(roomId).emit('word-guessing-player-left', userId);
                    io.to(roomId).emit('word-guessing-game-state', room.gameState);
                    io.emit('wordGuessingRoomsList', getFilteredRoomsList());
                }
            }
        }
        socketIdToUserId.delete(socket.id);
    });
}

// Función para iniciar el temporizador de Word Guessing
function startWordGuessingTimer(roomId: string, room: WordGuessingRoom, io: Server) {
    // Limpiar temporizadores existentes
    if (room.timers.has('round')) {
        clearInterval(room.timers.get('round')!);
    }
    if (room.timers.has('reveal')) {
        clearInterval(room.timers.get('reveal')!);
    }

    // Temporizador principal de la ronda
    const timer = setInterval(() => {
        room.gameState.timeRemaining--;

        if (room.gameState.timeRemaining <= 0) {
            // Terminar la ronda
            endWordGuessingRound(roomId, room, io);
        } else {
            // Actualizar estado del juego
            io.to(roomId).emit('word-guessing-game-state', room.gameState);
        }
    }, 1000);
    room.timers.set('round', timer);

    // Temporizador para revelar letras
    const revealTimer = setInterval(() => {
        const { currentWord, revealedLetters } = room.gameState;
        // Buscar índices de letras no reveladas
        const unrevealed = revealedLetters
            .map((rev, idx) => (!rev ? idx : -1))
            .filter(idx => idx !== -1);
        if (unrevealed.length > 0) {
            // Elegir una letra aleatoria para revelar
            const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            revealedLetters[idx] = true;
            // Actualizar la palabra oculta
            room.gameState.hiddenWordDisplay = getHiddenWordDisplay(currentWord, revealedLetters);
            // Notificar a los jugadores
            io.to(roomId).emit('word-guessing-game-state', room.gameState);
        }
    }, LETTER_REVEAL_INTERVAL * 1000);
    room.timers.set('reveal', revealTimer);
}

// Función para terminar una ronda de Word Guessing
function endWordGuessingRound(roomId: string, room: WordGuessingRoom, io: Server) {
    // Limpiar temporizador
    if (room.timers.has('round')) {
        clearInterval(room.timers.get('round')!);
        room.timers.delete('round');
    }
    if (room.timers.has('reveal')) {
        clearInterval(room.timers.get('reveal')!);
        room.timers.delete('reveal');
    }

    // Terminar la ronda
    const roundEndData = endRound(room.gameState, room.gameState.correctGuesses);
    Object.assign(room.gameState, roundEndData);

    // Sincronizar room.players con gameState.players
    room.players = room.gameState.players;

    // Notificar a todos los jugadores
    io.to(roomId).emit('word-guessing-round-end', {
        correctGuesses: room.gameState.correctGuesses,
        scores: room.gameState.players
    });

    // Verificar si el juego ha terminado
    if (isGameOver(room.gameState.roundNumber)) {
        const gameEndData = endGame(room.gameState.players);
        Object.assign(room.gameState, gameEndData);

        io.to(roomId).emit('word-guessing-game-end', {
            finalScores: room.gameState.players
        });
    } else {
        // Iniciar siguiente ronda después de 5 segundos
        setTimeout(() => {
            // Usar playerOrder para la rotación de turnos
            let nextDrawerId = room.gameState.currentDrawer;
            if (!room.playerOrder.includes(nextDrawerId)) {
                nextDrawerId = room.playerOrder[0] || '';
            }
            const nextRoundData = startNewRound(
                room.players,
                room.gameState.roundNumber + 1,
                nextDrawerId,
                room.playerOrder
            );
            Object.assign(room.gameState, nextRoundData);

            // Sincronizar room.players con gameState.players
            room.players = room.gameState.players;

            // Limpiar datos de dibujo
            room.drawingData = [];
            room.gameState.drawingData = [];

            // Notificar a todos los jugadores
            io.to(roomId).emit('word-guessing-game-state', room.gameState);
            io.to(roomId).emit('word-guessing-round-start', {
                word: room.gameState.currentWord,
                drawer: room.gameState.currentDrawer,
                timeRemaining: room.gameState.timeRemaining
            });

            // Iniciar temporizador
            startWordGuessingTimer(roomId, room, io);
        }, 5000);
    }
}

// Función para obtener las salas de Word Guessing
export function getWordGuessingRooms() {
    return wordGuessingRooms;
}

// Limpieza automática de salas vacías o inactivas cada 2 minutos
setInterval(() => {
    const ONE_HOUR = 60 * 60 * 1000;
    for (const [roomId, room] of wordGuessingRooms.entries()) {
        // Eliminar salas sin jugadores
        if (!room.players || room.players.length === 0) {
            wordGuessingRooms.delete(roomId);
            if (globalIO) globalIO.emit('wordGuessingRoomsList', getFilteredRoomsList());
            continue;
        }
        // Eliminar salas inactivas por más de 1 hora
        if (Date.now() - (room.gameState.roundStartTime || 0) > ONE_HOUR) {
            wordGuessingRooms.delete(roomId);
            if (globalIO) globalIO.emit('wordGuessingRoomsList', getFilteredRoomsList());
        }
    }
}, 2 * 60 * 1000);

// Modificar la emisión de la lista de salas para filtrar solo las que tienen jugadores
function getFilteredRoomsList() {
    return Array.from(wordGuessingRooms.values())
        .filter(room => room.players && room.players.length > 0)
        .map(room => ({
            id: room.id,
            players: room.players.length,
            gameStarted: room.gameState.gamePhase !== 'waiting',
            creatorName: room.creatorName
        }));
} 