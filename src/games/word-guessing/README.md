# 🎨 Adivina la Palabra

Un juego multijugador de dibujo y adivinanza en tiempo real donde un jugador dibuja una palabra y los demás intentan adivinarla.

## 🎮 Cómo jugar

### Objetivo
- Un jugador dibuja una palabra en el canvas
- Los demás jugadores intentan adivinar la palabra escribiendo en el chat
- Quien adivine gana puntos
- Se turnan para dibujar

### Reglas
1. **Mínimo 2 jugadores** para comenzar
2. **60 segundos** para dibujar
3. **90 segundos** total por ronda
4. **5 rondas** por partida
5. **10 puntos** por adivinar correctamente
5. **5 puntos** por dibujar (si alguien adivina)
6. **Bonus de tiempo** por adivinar rápido

### Características

#### 🎨 Canvas de Dibujo
- **12 colores** disponibles
- **Tamaño de pincel** ajustable (1-20px)
- **Dibujo en tiempo real** para todos los jugadores
- **Botón de limpiar** para el dibujante

#### 💬 Chat en Tiempo Real
- **Mensajes instantáneos** entre jugadores
- **Detección automática** de respuestas correctas
- **Marcado especial** para respuestas correctas
- **Deshabilitado** para el dibujante

#### 👥 Sistema de Jugadores
- **Lista de jugadores** con puntuaciones
- **Indicador de turno** de dibujo
- **Estado de adivinación** por jugador
- **Ranking** en tiempo real

#### ⏰ Temporizador
- **Cuenta regresiva** visible para todos
- **Cambio de color** según tiempo restante
- **Alerta visual** en últimos 10 segundos

## 🏗️ Arquitectura

### Componentes
- `WordGuessingGame` - Componente principal
- `DrawingCanvas` - Canvas de dibujo
- `ChatBox` - Sistema de chat
- `PlayerList` - Lista de jugadores
- `GameTimer` - Temporizador
- `WordGuessingLobby` - Pantalla de lobby
- `WordGuessingRoomStatus` - Estado de sala

### Hooks
- `useWordGuessingGame` - Lógica principal del juego

### Tipos
- `WordGuessingPlayer` - Información del jugador
- `WordGuessingGameState` - Estado del juego
- `ChatMessage` - Mensaje del chat
- `DrawingPoint` - Punto de dibujo
- `WordCategory` - Categoría de palabras

### Utilidades
- `wordCategories.ts` - Categorías y palabras
- `gameLogic.ts` - Lógica del juego

## 🎯 Estados del Juego

### `waiting`
- Pantalla de lobby
- Esperando jugadores
- Botón para iniciar juego

### `drawing`
- Fase de dibujo
- Canvas activo para dibujante
- Chat deshabilitado para dibujante

### `guessing`
- Fase de adivinanza
- Canvas de solo lectura
- Chat activo para todos

### `round-end`
- Resultados de la ronda
- Puntuaciones actualizadas
- Botón para siguiente ronda

### `game-end`
- Resultados finales
- Ranking de jugadores
- Opción de jugar de nuevo

## 🎨 Categorías de Palabras

### Animales 🐾
- perro, gato, elefante, león, tigre, oso, zebra, jirafa...

### Comida 🍕
- pizza, hamburguesa, ensalada, sopa, pasta, arroz...

### Objetos 📦
- mesa, silla, cama, televisión, computadora, teléfono...

### Naturaleza 🌿
- árbol, flor, montaña, río, mar, playa, bosque...

### Transporte 🚗
- coche, camión, avión, barco, bicicleta, tren...

### Profesiones 👨‍⚕️
- doctor, profesor, policía, bombero, piloto, cocinero...

### Deportes ⚽
- fútbol, baloncesto, tenis, natación, boxeo, golf...

### Emociones 😊
- feliz, triste, enojado, sorprendido, emocionado...

## 🚀 Tecnologías

- **React 19** - Framework frontend
- **TypeScript** - Tipado estático
- **Socket.io** - Comunicación en tiempo real
- **Canvas API** - Dibujo en tiempo real
- **Tailwind CSS** - Estilos y diseño
- **Vite** - Build tool

## 🔧 Configuración

### Variables de Entorno
```env
VITE_SOCKET_URL=http://localhost:3001
```

### Dependencias
```json
{
  "socket.io-client": "^4.7.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0"
}
```

## 🎯 Características Técnicas

### Sincronización en Tiempo Real
- **WebSockets** para comunicación instantánea
- **Canvas sync** para dibujo en tiempo real
- **Chat sync** para mensajes instantáneos
- **Game state sync** para estado del juego

### Validación de Respuestas
- **Coincidencia exacta** de palabras
- **Ignorar acentos** y mayúsculas
- **Detección de variaciones** (ej: "es un perro")
- **Prevención de spam** y respuestas duplicadas

### Sistema de Puntuación
- **Puntos base** por adivinar
- **Bonus de tiempo** por velocidad
- **Puntos por dibujar** si alguien adivina
- **Ranking en tiempo real**

### Manejo de Errores
- **Reconexión automática** en desconexiones
- **Validación de entrada** en chat
- **Límites de tiempo** para prevenir spam
- **Estados de carga** y error

## 🎨 Personalización

### Agregar Nuevas Categorías
```typescript
// En wordCategories.ts
{
    id: 'nueva-categoria',
    name: 'Nueva Categoría',
    words: ['palabra1', 'palabra2', 'palabra3']
}
```

### Modificar Configuración
```typescript
// En gameLogic.ts
export const POINTS_FOR_CORRECT_GUESS = 15; // Cambiar puntos
export const DRAWING_TIME = 90; // Cambiar tiempo de dibujo
export const MAX_ROUNDS = 10; // Cambiar número de rondas
```

### Personalizar Colores
```typescript
// En DrawingCanvas.tsx
const colors = [
    '#FF0000', '#00FF00', '#0000FF', // Agregar nuevos colores
    // ... más colores
];
```

## 🐛 Solución de Problemas

### Canvas no funciona
- Verificar que el navegador soporte Canvas API
- Comprobar permisos de JavaScript
- Revisar consola para errores

### Chat no sincroniza
- Verificar conexión WebSocket
- Comprobar latencia de red
- Revisar logs del servidor

### Palabras no se detectan
- Verificar normalización de texto
- Comprobar configuración de idioma
- Revisar logs de validación

## 📈 Métricas y Analytics

### Métricas del Juego
- **Tiempo promedio** de adivinanza
- **Tasa de éxito** por categoría
- **Puntuaciones promedio** por jugador
- **Tiempo de dibujo** promedio

### Métricas Técnicas
- **Latencia** de conexión
- **Tasa de desconexión**
- **Rendimiento** del canvas
- **Uso de memoria**

## 🚀 Roadmap

### Próximas Características
- [ ] **Categorías personalizadas** por sala
- [ ] **Modo privado** con contraseña
- [ ] **Sistema de pistas** para palabras difíciles
- [ ] **Modo torneo** con eliminación
- [ ] **Estadísticas detalladas** por jugador
- [ ] **Temas visuales** personalizables
- [ ] **Sonidos** y efectos de audio
- [ ] **Modo espectador** para salas grandes

### Mejoras Técnicas
- [ ] **Optimización** del canvas para móviles
- [ ] **Compresión** de datos de dibujo
- [ ] **Caché** de palabras por categoría
- [ ] **Lazy loading** de componentes
- [ ] **Service Worker** para offline
- [ ] **PWA** con instalación nativa

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 