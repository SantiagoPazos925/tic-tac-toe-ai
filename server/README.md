# 🎨 Servidor Word Guessing

Servidor backend para el juego Word Guessing (Adivina la Palabra) con Socket.io.

## 🚀 Características

### Eventos de Socket.io

#### Conexión del Cliente
- `ping` - Medición de latencia
- `pong` - Respuesta de latencia

#### Word Guessing Events

##### Unirse al Juego
- `join-word-guessing-room` - Unirse a una sala
  ```typescript
  {
    roomId: string,
    playerName: string
  }
  ```

##### Iniciar Juego
- `word-guessing-start` - Iniciar el juego
  ```typescript
  {
    roomId: string
  }
  ```

##### Chat y Mensajes
- `word-guessing-message` - Enviar mensaje de chat
  ```typescript
  {
    roomId: string,
    message: string
  }
  ```

##### Dibujo
- `word-guessing-draw` - Enviar datos de dibujo
  ```typescript
  {
    roomId: string,
    drawingPoint: {
      x: number,
      y: number,
      color: string,
      size: number,
      isDrawing: boolean
    }
  }
  ```

- `word-guessing-clear` - Limpiar canvas
  ```typescript
  {
    roomId: string
  }
  ```

### Respuestas del Servidor

#### Estado del Juego
- `word-guessing-game-state` - Estado completo del juego
- `word-guessing-player-joined` - Jugador se unió
- `word-guessing-player-left` - Jugador se desconectó

#### Rondas
- `word-guessing-round-start` - Inicio de ronda
- `word-guessing-round-end` - Fin de ronda
- `word-guessing-game-end` - Fin del juego

#### Dibujo
- `word-guessing-drawing-update` - Actualización de dibujo
- `word-guessing-canvas-cleared` - Canvas limpiado

#### Chat
- `word-guessing-message` - Nuevo mensaje

## 🏗️ Arquitectura

### Estructura de Datos

#### WordGuessingRoom
```typescript
interface WordGuessingRoom {
    id: string;
    players: WordGuessingPlayer[];
    gameState: WordGuessingGameState;
    drawingData: DrawingPoint[];
    messages: ChatMessage[];
    timers: Map<string, NodeJS.Timeout>;
}
```

#### WordGuessingPlayer
```typescript
interface WordGuessingPlayer {
    id: string;
    name: string;
    isDrawing: boolean;
    score: number;
    hasGuessed: boolean;
}
```

#### WordGuessingGameState
```typescript
interface WordGuessingGameState {
    currentWord: string;
    currentDrawer: string;
    players: WordGuessingPlayer[];
    gamePhase: 'waiting' | 'drawing' | 'guessing' | 'round-end' | 'game-end';
    timeRemaining: number;
    roundNumber: number;
    maxRounds: number;
    messages: ChatMessage[];
    drawingData: DrawingPoint[];
    correctGuesses: string[];
    roundStartTime: number;
}
```

### Gestión de Salas

#### Crear Sala
```typescript
const room = {
    id: roomId,
    players: [newPlayer],
    gameState: initializeGameState([newPlayer]),
    drawingData: [],
    messages: [],
    timers: new Map()
};
wordGuessingRooms.set(roomId, room);
```

#### Unirse a Sala
```typescript
const newPlayer: WordGuessingPlayer = {
    id: socket.id,
    name: playerName,
    isDrawing: false,
    score: 0,
    hasGuessed: false
};
room.players.push(newPlayer);
room.gameState.players.push(newPlayer);
```

### Lógica del Juego

#### Iniciar Juego
1. Verificar mínimo 2 jugadores
2. Inicializar estado del juego
3. Asignar primer dibujante
4. Generar palabra aleatoria
5. Iniciar temporizador

#### Manejo de Respuestas
```typescript
const isCorrectGuess = checkGuess(message, room.gameState.currentWord);
if (isCorrectGuess && !player.hasGuessed) {
    player.hasGuessed = true;
    room.gameState.correctGuesses.push(player.name);
}
```

#### Temporizador
```typescript
const timer = setInterval(() => {
    room.gameState.timeRemaining--;
    if (room.gameState.timeRemaining <= 0) {
        endWordGuessingRound(roomId, room);
    }
}, 1000);
```

### Validación de Respuestas

#### Función checkGuess
```typescript
export const checkGuess = (message: string, currentWord: string): boolean => {
    const normalizedMessage = message.toLowerCase().trim();
    const normalizedWord = currentWord.toLowerCase().trim();
    
    // Coincidencia exacta
    if (normalizedMessage === normalizedWord) return true;
    
    // Sin acentos
    const withoutAccents = (str: string) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    
    if (withoutAccents(normalizedMessage) === withoutAccents(normalizedWord)) {
        return true;
    }
    
    // Contiene la palabra
    if (normalizedMessage.includes(normalizedWord) || normalizedWord.includes(normalizedMessage)) {
        return true;
    }
    
    return false;
};
```

### Sistema de Puntuación

#### Cálculo de Puntos
```typescript
export const calculateScore = (
    player: WordGuessingPlayer,
    isCorrectGuess: boolean,
    isDrawer: boolean,
    timeRemaining: number
): number => {
    let score = player.score;
    
    if (isCorrectGuess) {
        score += POINTS_FOR_CORRECT_GUESS; // 10 puntos
        const timeBonus = Math.floor((timeRemaining / ROUND_TIME) * 5);
        score += timeBonus;
    }
    
    if (isDrawer) {
        score += POINTS_FOR_DRAWING; // 5 puntos
    }
    
    return score;
};
```

## 🔧 Configuración

### Variables de Entorno
```env
PORT=3001
NODE_ENV=development
RAILWAY_PUBLIC_DOMAIN=your-domain.railway.app
```

### Dependencias
```json
{
  "express": "^4.18.0",
  "socket.io": "^4.7.0",
  "cors": "^2.8.5"
}
```

### CORS Configuration
```typescript
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
```

## 🚀 Despliegue

### Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Deploy
railway up
```

### Variables de Entorno en Railway
- `PORT` - Puerto del servidor (automático)
- `RAILWAY_PUBLIC_DOMAIN` - Dominio público (automático)

## 📊 Monitoreo

### Health Check
```typescript
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
```

### Logs
```typescript
console.log('Usuario conectado:', socket.id);
console.log('Usuario desconectado:', socket.id);
console.log(`Servidor corriendo en puerto ${PORT}`);
```

## 🔒 Seguridad

### Validación de Entrada
- Verificar que el jugador existe en la sala
- Validar que es el turno del dibujante
- Sanitizar mensajes de chat

### Rate Limiting
- Límite de mensajes por segundo
- Prevención de spam en chat
- Validación de datos de dibujo

### Manejo de Errores
```typescript
try {
    // Lógica del juego
} catch (error) {
    console.error('Error en Word Guessing:', error);
    socket.emit('error', { message: 'Error interno del servidor' });
}
```

## 🧪 Testing

### Eventos de Prueba
```typescript
// Simular unirse a sala
socket.emit('join-word-guessing-room', {
    roomId: 'TEST123',
    playerName: 'TestPlayer'
});

// Simular mensaje
socket.emit('word-guessing-message', {
    roomId: 'TEST123',
    message: 'perro'
});
```

### Verificación de Estado
```typescript
const room = wordGuessingRooms.get('TEST123');
console.log('Estado de la sala:', room?.gameState);
console.log('Jugadores:', room?.players);
```

## 📈 Métricas

### Estadísticas del Servidor
- Número de salas activas
- Jugadores conectados
- Latencia promedio
- Tasa de desconexión

### Métricas del Juego
- Palabras más adivinadas
- Tiempo promedio de adivinanza
- Puntuaciones promedio
- Categorías más populares

## 🔄 Actualizaciones

### Versión 1.0
- ✅ Sistema básico de salas
- ✅ Dibujo en tiempo real
- ✅ Chat con validación
- ✅ Sistema de puntuación
- ✅ Temporizador automático

### Próximas Características
- [ ] Categorías personalizadas
- [ ] Modo privado con contraseña
- [ ] Estadísticas detalladas
- [ ] Sistema de pistas
- [ ] Modo torneo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 