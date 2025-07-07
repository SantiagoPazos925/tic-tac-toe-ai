# 🎨 Instrucciones para Probar Word Guessing

## 🚀 Configuración Inicial

### 1. Instalar Dependencias
```bash
# En el directorio raíz
npm install

# En el directorio del servidor
cd server
npm install
```

### 2. Compilar el Servidor
```bash
cd server
npm run build
```

### 3. Iniciar el Servidor
```bash
# Opción 1: Desarrollo (con hot reload)
npm run dev

# Opción 2: Producción
npm start
```

### 4. Iniciar el Cliente
```bash
# En el directorio raíz
npm run dev
```

## 🧪 Pruebas Automáticas

### Ejecutar Prueba del Servidor
```bash
cd server
npm run test:word-guessing
```

Esta prueba simula:
- 2 jugadores conectándose
- Un jugador dibujando
- Otro jugador adivinando
- Verificación de eventos del servidor

## 🎮 Pruebas Manuales

### 1. Acceder al Juego
1. Abre `http://localhost:5173` en tu navegador
2. Ingresa tu nombre
3. Selecciona "Adivina la Palabra" del menú
4. Se generará automáticamente un código de sala

### 2. Probar con Múltiples Jugadores

#### Opción A: Múltiples Pestañas
1. Abre 2-3 pestañas del navegador
2. En cada pestaña, ingresa un nombre diferente
3. Usa el mismo código de sala en todas
4. Inicia el juego cuando haya al menos 2 jugadores

#### Opción B: Múltiples Dispositivos
1. Encuentra tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. En otros dispositivos, accede a `http://TU_IP:5173`
3. Usa el mismo código de sala

### 3. Flujo de Prueba

#### Fase 1: Lobby
- ✅ Verificar que aparezcan todos los jugadores
- ✅ Verificar que el botón "Iniciar Juego" aparezca con 2+ jugadores
- ✅ Verificar que se pueda copiar el código de sala

#### Fase 2: Dibujo
- ✅ Verificar que solo el dibujante pueda dibujar
- ✅ Verificar que los controles de color funcionen
- ✅ Verificar que el slider de tamaño funcione
- ✅ Verificar que el botón "Limpiar Canvas" funcione
- ✅ Verificar que el dibujo se sincronice en tiempo real

#### Fase 3: Adivinanza
- ✅ Verificar que el chat esté deshabilitado para el dibujante
- ✅ Verificar que se puedan enviar mensajes
- ✅ Verificar que las respuestas correctas se detecten
- ✅ Verificar que las respuestas incorrectas no se marquen
- ✅ Verificar que el temporizador funcione

#### Fase 4: Resultados
- ✅ Verificar que se muestren las puntuaciones
- ✅ Verificar que se muestren las respuestas correctas
- ✅ Verificar que se pueda continuar a la siguiente ronda

#### Fase 5: Final del Juego
- ✅ Verificar que se muestre el ranking final
- ✅ Verificar que se pueda jugar de nuevo

## 🔧 Debugging

### Verificar Conexión del Servidor
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3001/health
```

### Verificar Logs del Servidor
```bash
# En la terminal del servidor, deberías ver:
# Usuario conectado: [socket-id]
# Usuario desconectado: [socket-id]
```

### Verificar Logs del Cliente
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores de conexión o eventos

### Problemas Comunes

#### Error: "Conectando al servidor..."
- Verificar que el servidor esté corriendo en puerto 3001
- Verificar que no haya firewall bloqueando
- Verificar la variable `VITE_SOCKET_URL`

#### Error: "No se puede dibujar"
- Verificar que seas el dibujante actual
- Verificar que el juego esté en fase "drawing"
- Verificar la conexión WebSocket

#### Error: "Chat no funciona"
- Verificar que no seas el dibujante
- Verificar que el juego esté en fase "guessing"
- Verificar que el mensaje no esté vacío

#### Error: "No se detectan respuestas correctas"
- Verificar que la palabra esté en español
- Verificar que no haya espacios extra
- Verificar que la validación ignore acentos

## 📊 Métricas de Prueba

### Rendimiento
- **Latencia**: Debería ser < 100ms
- **FPS del Canvas**: Debería ser > 30fps
- **Tiempo de respuesta**: < 500ms

### Funcionalidad
- **Sincronización**: Dibujo en tiempo real
- **Validación**: Respuestas correctas detectadas
- **Puntuación**: Cálculo correcto de puntos
- **Temporizador**: Cuenta regresiva precisa

### Usabilidad
- **Interfaz**: Responsive en móvil/desktop
- **Accesibilidad**: Navegación por teclado
- **Feedback**: Mensajes claros al usuario

## 🐛 Reportar Errores

Si encuentras un error:

1. **Captura de pantalla** del error
2. **Logs del servidor** (si aplica)
3. **Logs del cliente** (F12 → Console)
4. **Pasos para reproducir** el error
5. **Navegador y versión** utilizados

## 🚀 Despliegue

### Railway
```bash
# En el directorio raíz
railway up
```

### Vercel (Solo Frontend)
```bash
# En el directorio raíz
vercel
```

## 📝 Notas de Desarrollo

### Estructura de Archivos
```
src/games/word-guessing/
├── components/          # Componentes React
├── hooks/              # Hooks personalizados
├── types/              # Tipos TypeScript
├── utils/              # Utilidades del juego
└── README.md           # Documentación

server/
├── utils/              # Utilidades del servidor
├── test-word-guessing.js  # Script de prueba
└── README.md           # Documentación del servidor
```

### Eventos Socket.io
- `join-word-guessing-room` - Unirse a sala
- `word-guessing-start` - Iniciar juego
- `word-guessing-message` - Enviar mensaje
- `word-guessing-draw` - Enviar dibujo
- `word-guessing-clear` - Limpiar canvas

### Estados del Juego
- `waiting` - Esperando jugadores
- `drawing` - Fase de dibujo
- `guessing` - Fase de adivinanza
- `round-end` - Fin de ronda
- `game-end` - Fin del juego

¡Disfruta probando el juego! 🎨✨ 