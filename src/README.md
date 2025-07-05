# Estructura del Proyecto

## 📁 Organización de Carpetas

```
src/
├── games/                    # Juegos específicos
│   └── tic-tac-toe/         # Juego Tic-Tac-Toe
│       ├── components/       # Componentes específicos del juego
│       ├── hooks/           # Hooks específicos del juego
│       ├── types/           # Tipos específicos del juego
│       └── index.ts         # Exportaciones del juego
├── shared/                   # Recursos compartidos
│   ├── components/          # Componentes reutilizables
│   ├── hooks/              # Hooks compartidos
│   ├── types/              # Tipos compartidos
│   ├── utils/              # Utilidades compartidas
│   └── index.ts            # Exportaciones compartidas
├── App.tsx                  # Componente principal
└── index.tsx               # Punto de entrada
```

## 🎮 Juegos

### Tic-Tac-Toe
- **Ubicación**: `src/games/tic-tac-toe/`
- **Componentes**: Board, Square, Lobby, RoomStatus
- **Hooks**: useSocket
- **Tipos**: Player, BoardState, GameState, PlayerInfo

## 🔧 Recursos Compartidos

### Componentes
- **GameMenu**: Menú principal de juegos
- **PlayerNameInput**: Entrada de nombre del jugador
- **ConnectionStats**: Indicador de latencia

### Tipos
- **Game**: Configuración de juegos
- **PlayerInfo**: Información del jugador
- **GameState**: Estado del juego
- **RoomInfo**: Información de la sala

### Utilidades
- **gameConfig**: Configuración centralizada de juegos

## 📦 Exportaciones

### Juego Tic-Tac-Toe
```typescript
import { Board, Lobby, RoomStatus, useSocket, BoardState } from './games/tic-tac-toe';
```

### Recursos Compartidos
```typescript
import { GameMenu, PlayerNameInput, ConnectionStats } from './shared';
```

## 🚀 Agregar Nuevos Juegos

1. Crear carpeta `src/games/[nombre-juego]/`
2. Crear subcarpetas: `components/`, `hooks/`, `types/`
3. Crear archivo `index.ts` con exportaciones
4. Agregar configuración en `src/shared/utils/gameConfig.ts`
5. Actualizar `src/App.tsx` para manejar el nuevo juego

## 📋 Beneficios de la Nueva Estructura

✅ **Separación clara**: Cada juego tiene su propia carpeta
✅ **Reutilización**: Componentes compartidos en `shared/`
✅ **Escalabilidad**: Fácil agregar nuevos juegos
✅ **Mantenibilidad**: Código organizado y documentado
✅ **Tipos centralizados**: Tipos compartidos bien definidos
✅ **Configuración centralizada**: Juegos configurados en un solo lugar 