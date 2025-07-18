# Backend - Estructura Modular

Este backend ha sido refactorizado siguiendo una arquitectura modular y escalable, similar a la estructura implementada en el frontend.

## Estructura de Directorios

```
server/
├── index.ts                 # Punto de entrada principal
├── package.json             # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
├── users.db                # Base de datos SQLite (desarrollo)
├── README.md               # Esta documentación
├── config/                 # Configuración centralizada
│   └── index.ts            # Configuración del servidor, DB, CORS, etc.
├── types/                  # Definiciones de tipos TypeScript
│   └── index.ts            # Interfaces y tipos principales
├── services/               # Lógica de negocio
│   ├── database.ts         # Servicio de base de datos (SQLite/PostgreSQL)
│   ├── auth.ts             # Servicio de autenticación
│   ├── lobby.ts            # Servicio del lobby en tiempo real
│   └── socket.ts           # Servicio de Socket.IO
├── controllers/            # Controladores de la API
│   ├── auth.ts             # Controlador de autenticación
│   └── users.ts            # Controlador de usuarios
├── routes/                 # Definición de rutas
│   ├── auth.ts             # Rutas de autenticación
│   └── users.ts            # Rutas de usuarios
├── middleware/             # Middleware personalizado
│   └── auth.ts             # Middleware de autenticación y utilidades
└── utils/                  # Utilidades y helpers
    ├── validation.ts       # Validaciones de entrada
    └── logger.ts           # Sistema de logging
```

## Arquitectura

### 1. Configuración (`config/`)
- **Configuración centralizada**: Todas las configuraciones en un solo lugar
- **Variables de entorno**: Manejo seguro de configuraciones sensibles
- **Configuraciones específicas**: CORS, JWT, Socket.IO, validación, lobby

### 2. Tipos (`types/`)
- **Interfaces TypeScript**: Definiciones claras de tipos
- **Tipos de usuario**: User, UserProfile, AuthUser
- **Tipos de lobby**: LobbyUser, ChatMessage
- **Tipos de API**: Request/Response, configuración

### 3. Servicios (`services/`)
- **Lógica de negocio**: Separada de controladores y rutas
- **Base de datos**: Patrón abstracto para SQLite/PostgreSQL
- **Autenticación**: JWT, validación, registro/login
- **Lobby**: Gestión de usuarios conectados y chat
- **Socket.IO**: Manejo de conexiones en tiempo real

### 4. Controladores (`controllers/`)
- **Manejo de requests**: Lógica específica de endpoints
- **Respuestas estandarizadas**: Formato consistente de API
- **Manejo de errores**: Centralizado y consistente

### 5. Rutas (`routes/`)
- **Definición de endpoints**: Organización por funcionalidad
- **Middleware**: Rate limiting, autenticación
- **Validación**: Middleware de validación de entrada

### 6. Middleware (`middleware/`)
- **Autenticación**: JWT verification, roles
- **Rate limiting**: Protección contra spam
- **Logging**: Request logging, error handling
- **CORS**: Configuración de cross-origin

### 7. Utilidades (`utils/`)
- **Validación**: Validación de entrada de usuario
- **Logging**: Sistema de logging estructurado
- **Helpers**: Funciones de utilidad comunes

## Características Principales

### 🔐 Autenticación
- JWT tokens con expiración configurable
- Validación de credenciales
- Rate limiting en endpoints de auth
- Middleware de autenticación reutilizable

### 💬 Lobby en Tiempo Real
- Socket.IO para comunicación bidireccional
- Gestión de usuarios conectados
- Chat en tiempo real con historial
- Manejo de reconexiones
- Estados de usuario (online/away/offline)

### 🗄️ Base de Datos
- Soporte para SQLite (desarrollo) y PostgreSQL (producción)
- Patrón abstracto para fácil cambio de DB
- Migraciones automáticas de esquemas
- Pool de conexiones optimizado

### 📊 Logging
- Logging estructurado con colores
- Diferentes niveles (ERROR, WARN, INFO, DEBUG)
- Logs específicos por módulo (AUTH, LOBBY, DB, SOCKET)
- Timestamps y contexto detallado

### 🛡️ Seguridad
- Validación de entrada robusta
- Sanitización de datos
- Rate limiting configurable
- Manejo seguro de errores
- CORS configurado

### 🔧 Configuración
- Variables de entorno centralizadas
- Configuración por ambiente (dev/prod)
- Configuraciones específicas por módulo
- Fácil mantenimiento y escalabilidad

## Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuario
- `POST /login` - Inicio de sesión
- `GET /profile` - Obtener perfil (requiere auth)
- `POST /verify` - Verificar token

### Usuarios (`/api/users`)
- `GET /` - Obtener todos los usuarios
- `GET /stats` - Estadísticas de usuarios

### Sistema
- `GET /health` - Health check
- `GET /` - Información del servidor
- `GET /api/hello` - Endpoint de ejemplo

## Eventos de Socket.IO

### Cliente → Servidor
- `join-lobby` - Unirse al lobby
- `send-message` - Enviar mensaje
- `update-status` - Cambiar estado
- `leave-lobby` - Salir del lobby
- `ping` - Ping para latencia

### Servidor → Cliente
- `user-joined` - Usuario se unió
- `user-left` - Usuario se fue
- `user-updated` - Usuario actualizado
- `chat-message` - Nuevo mensaje
- `users-list` - Lista de usuarios
- `chat-history` - Historial del chat
- `pong` - Respuesta al ping

## Desarrollo

### Instalación
```bash
npm install
```

### Desarrollo local
```bash
npm run dev
```

### Compilación
```bash
npm run build
```

### Producción
```bash
npm start
```

## Variables de Entorno

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=tu-secreto-super-seguro

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Mantenimiento

### Agregar nuevos endpoints
1. Crear controlador en `controllers/`
2. Definir rutas en `routes/`
3. Agregar tipos en `types/` si es necesario
4. Actualizar documentación

### Agregar nuevos servicios
1. Crear servicio en `services/`
2. Implementar interfaces necesarias
3. Agregar configuración en `config/`
4. Actualizar tipos

### Agregar middleware
1. Crear middleware en `middleware/`
2. Aplicar en rutas correspondientes
3. Documentar funcionalidad

## Escalabilidad

La arquitectura está diseñada para escalar fácilmente:

- **Microservicios**: Cada servicio puede ser independiente
- **Base de datos**: Fácil cambio entre SQLite y PostgreSQL
- **Caché**: Preparado para agregar Redis
- **Load balancing**: Estructura lista para múltiples instancias
- **Monitoreo**: Logging estructurado para observabilidad 