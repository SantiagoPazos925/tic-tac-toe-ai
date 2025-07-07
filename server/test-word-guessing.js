const io = require('socket.io-client');

// Configuración
const SERVER_URL = 'http://localhost:3001';
const ROOM_ID = 'TEST123';

// Cliente 1 - Dibujante
const client1 = io(SERVER_URL);

client1.on('connect', () => {
    console.log('🖌️ Cliente 1 (Dibujante) conectado');

    // Unirse a la sala
    client1.emit('join-word-guessing-room', {
        roomId: ROOM_ID,
        playerName: 'Dibujante'
    });
});

client1.on('word-guessing-player-joined', (player) => {
    console.log('✅ Cliente 1 se unió como:', player.name);
});

client1.on('word-guessing-game-state', (gameState) => {
    console.log('📊 Estado del juego recibido por Cliente 1:');
    console.log('- Fase:', gameState.gamePhase);
    console.log('- Jugadores:', gameState.players.length);
    console.log('- Palabra actual:', gameState.currentWord);
});

client1.on('word-guessing-round-start', (data) => {
    console.log('🎨 Ronda iniciada - Cliente 1 es dibujante');
    console.log('- Palabra a dibujar:', data.word);
    console.log('- Tiempo restante:', data.timeRemaining);

    // Simular dibujo
    setTimeout(() => {
        client1.emit('word-guessing-draw', {
            roomId: ROOM_ID,
            drawingPoint: {
                x: 100,
                y: 100,
                color: '#000000',
                size: 3,
                isDrawing: true
            }
        });
        console.log('✏️ Cliente 1 dibujó un punto');
    }, 2000);
});

// Cliente 2 - Adivinador
const client2 = io(SERVER_URL);

client2.on('connect', () => {
    console.log('👀 Cliente 2 (Adivinador) conectado');

    // Unirse a la sala después de un delay
    setTimeout(() => {
        client2.emit('join-word-guessing-room', {
            roomId: ROOM_ID,
            playerName: 'Adivinador'
        });
    }, 1000);
});

client2.on('word-guessing-player-joined', (player) => {
    console.log('✅ Cliente 2 se unió como:', player.name);
});

client2.on('word-guessing-game-state', (gameState) => {
    console.log('📊 Estado del juego recibido por Cliente 2:');
    console.log('- Fase:', gameState.gamePhase);
    console.log('- Jugadores:', gameState.players.length);
});

client2.on('word-guessing-round-start', (data) => {
    console.log('👀 Ronda iniciada - Cliente 2 es adivinador');
    console.log('- Tiempo restante:', data.timeRemaining);

    // Simular adivinanza correcta
    setTimeout(() => {
        client2.emit('word-guessing-message', {
            roomId: ROOM_ID,
            message: 'perro' // Asumiendo que la palabra es "perro"
        });
        console.log('💬 Cliente 2 intentó adivinar: "perro"');
    }, 3000);
});

client2.on('word-guessing-message', (message) => {
    console.log('💬 Mensaje recibido:', message.message);
    if (message.isCorrectGuess) {
        console.log('🎉 ¡Respuesta correcta!');
    }
});

client2.on('word-guessing-round-end', (data) => {
    console.log('🏁 Ronda terminada');
    console.log('- Respuestas correctas:', data.correctGuesses);
    console.log('- Puntuaciones:', data.scores.map(p => `${p.name}: ${p.score} pts`));
});

// Eventos compartidos
[client1, client2].forEach((client, index) => {
    client.on('word-guessing-drawing-update', (drawingData) => {
        console.log(`🎨 Cliente ${index + 1} recibió actualización de dibujo:`, drawingData.length, 'puntos');
    });

    client.on('word-guessing-canvas-cleared', () => {
        console.log(`🧹 Cliente ${index + 1} recibió notificación de canvas limpiado`);
    });

    client.on('disconnect', () => {
        console.log(`❌ Cliente ${index + 1} desconectado`);
    });

    client.on('error', (error) => {
        console.error(`❌ Error en Cliente ${index + 1}:`, error);
    });
});

// Función para iniciar el juego
function startGame() {
    console.log('🚀 Iniciando juego...');
    client1.emit('word-guessing-start', { roomId: ROOM_ID });
}

// Función para limpiar
function cleanup() {
    console.log('🧹 Limpiando conexiones...');
    client1.disconnect();
    client2.disconnect();
    process.exit(0);
}

// Manejar señales de terminación
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Iniciar el juego después de que ambos clientes se conecten
setTimeout(startGame, 3000);

// Terminar después de 30 segundos
setTimeout(() => {
    console.log('⏰ Tiempo de prueba completado');
    cleanup();
}, 30000);

console.log('🧪 Iniciando prueba de Word Guessing...');
console.log('📝 Este script simula 2 jugadores:');
console.log('   - Cliente 1: Dibujante');
console.log('   - Cliente 2: Adivinador');
console.log('⏱️  La prueba durará 30 segundos'); 