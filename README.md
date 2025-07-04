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
├── src/                    # Código fuente del frontend
│   ├── components/         # Componentes React
│   │   ├── Board.tsx      # Tablero del juego
│   │   ├── Square.tsx     # Casillas individuales
│   │   ├── Lobby.tsx      # Pantalla de lobby
│   │   └── RoomStatus.tsx # Estado de la sala
│   ├── hooks/             # Hooks personalizados
│   │   └── useSocket.ts   # Hook para Socket.io
│   ├── services/          # Servicios
│   ├── types.ts          # Tipos TypeScript
│   ├── App.tsx           # Componente principal
│   └── index.tsx         # Punto de entrada
├── server/                # Servidor backend
│   ├── index.ts          # Servidor principal
│   ├── package.json      # Dependencias del servidor
│   └── tsconfig.json     # Configuración TypeScript del servidor
├── config/               # Archivos de configuración
│   ├── Dockerfile        # Configuración Docker
│   ├── railway.json      # Configuración Railway
│   └── .dockerignore     # Archivos ignorados por Docker
├── docs/                 # Documentación
│   ├── DEPLOYMENT.md     # Guía de despliegue
│   └── RAILWAY_DEPLOY.md # Documentación específica de Railway
├── scripts/              # Scripts de automatización
│   ├── deploy-railway.ps1 # Script de deploy para Windows
│   └── deploy-railway.sh  # Script de deploy para Unix
├── dist/                 # Archivos construidos (generado)
├── node_modules/         # Dependencias (generado)
└── package.json          # Dependencias del frontend
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
- **Sistema de medición de latencia** en tiempo real
- **Indicadores de calidad de conexión**

## 🚀 Deploy

### Railway (Recomendado) 🚄
Railway ofrece el despliegue más sencillo y rápido:

#### Deploy Automático
1. **Conectar repositorio** en [Railway](https://railway.com/)
2. **Seleccionar el repositorio** de GitHub
3. **Railway detectará automáticamente** la configuración
4. **¡Listo!** Tu app estará desplegada en segundos

#### Deploy con CLI
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

#### Deploy con Scripts Automáticos
```bash
# Windows
.\scripts\deploy-railway.ps1

# Linux/Mac
./scripts/deploy-railway.sh
```

#### Ventajas de Railway
- ✅ **Configuración automática** - No requiere archivos complejos
- ✅ **Despliegue instantáneo** - Build optimizado
- ✅ **Mejor UI** - Interfaz web intuitiva
- ✅ **Monitoreo integrado** - Logs y métricas en tiempo real
- ✅ **Escalado automático** - Se adapta a la demanda
- ✅ **Dominio personalizado** - Fácil configuración

### Alternativas

#### Vercel (Solo Frontend)
Para desplegar solo el frontend:
- **URL**: https://tic-tac-toe-ai-ochre.vercel.app
- **Configuración**: Automática desde GitHub

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
