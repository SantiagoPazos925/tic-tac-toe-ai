# Tic-Tac-Toe Online

Un juego de Tic-Tac-Toe multijugador en tiempo real construido con React, TypeScript, Socket.io y Express.

## 🚀 Características

- **Multijugador en tiempo real**: Juega con amigos usando Socket.io
- **Sistema de salas**: Crea o únete a salas con códigos únicos
- **Interfaz moderna**: Diseño responsive con Tailwind CSS
- **TypeScript**: Código tipado para mayor seguridad
- **Tiempo real**: Sincronización instantánea entre jugadores

## 🛠️ Tecnologías

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Comunicación**: WebSockets en tiempo real

## 📦 Instalación

1. **Clona el repositorio**:
   ```bash
   git clone <tu-repositorio>
   cd tic-tac-toe-ai
   ```

2. **Instala las dependencias del cliente**:
   ```bash
   npm install
   ```

3. **Instala las dependencias del servidor**:
   ```bash
   cd server
   npm install
   cd ..
   ```

## 🎮 Cómo jugar

### Opción 1: Ejecutar todo junto (Recomendado)
```bash
npm run dev:all
```

### Opción 2: Ejecutar por separado

**Terminal 1 - Servidor**:
```bash
npm run dev:server
```

**Terminal 2 - Cliente**:
```bash
npm run dev
```

## 🌐 Acceso

- **Cliente**: http://localhost:5173
- **Servidor**: http://localhost:3001

## 🎯 Cómo jugar

1. **Abre la aplicación** en tu navegador
2. **Crea una sala** o **únete a una existente**:
   - Para crear: Haz clic en "Crear nueva sala"
   - Para unirse: Ingresa el código de sala y haz clic en "Unirse"
3. **Comparte el código** de la sala con tu amigo
4. **¡Juega!** El primer jugador en hacer 3 en línea gana

## 🏗️ Estructura del proyecto

```
tic-tac-toe-ai/
├── components/          # Componentes React
│   ├── Board.tsx       # Tablero del juego
│   ├── Square.tsx      # Casillas individuales
│   ├── Lobby.tsx       # Pantalla de lobby
│   └── RoomStatus.tsx  # Estado de la sala
├── hooks/              # Hooks personalizados
│   └── useSocket.ts    # Hook para Socket.io
├── server/             # Servidor backend
│   ├── index.ts        # Servidor principal
│   └── package.json    # Dependencias del servidor
├── services/           # Servicios
├── types.ts           # Tipos TypeScript
└── App.tsx            # Componente principal
```

## 🔧 Scripts disponibles

- `npm run dev` - Ejecuta solo el cliente
- `npm run dev:server` - Ejecuta solo el servidor
- `npm run dev:all` - Ejecuta cliente y servidor juntos
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa de la build

## 🌟 Características técnicas

- **Sincronización en tiempo real** con Socket.io
- **Sistema de salas** con códigos únicos
- **Validación de movimientos** en el servidor
- **Manejo de desconexiones** automático
- **Interfaz responsive** para móviles y desktop
- **Animaciones suaves** con CSS transitions

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
