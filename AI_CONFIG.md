# 🤖 Configuración Optimizada para IA

## 📁 Estructura del Proyecto

```
tic-tac-toe-ai/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes reutilizables
│   ├── contexts/          # Context API para estado global
│   ├── hooks/             # Custom hooks
│   ├── services/          # Servicios (API, Socket.IO)
│   ├── types/             # Definiciones de tipos TypeScript
│   ├── utils/             # Utilidades y helpers
│   └── styles/            # Estilos CSS/Tailwind
├── server/                # Backend Node.js + Express + Socket.IO
│   ├── controllers/       # Controladores de rutas
│   ├── middleware/        # Middleware personalizado
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   └── types/            # Tipos del servidor
└── public/               # Archivos estáticos
```

## 🎯 Convenciones para IA

### **Nomenclatura**
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useSocket.ts`)
- **Servicios**: camelCase (`authService.ts`)
- **Tipos**: PascalCase (`User.ts`)
- **Utilidades**: camelCase (`formatters.ts`)

### **Imports Optimizados**
```typescript
// ✅ Correcto - Usar alias de paths
import { UserProfile } from '@/components/UserProfile';
import { useSocket } from '@/hooks/useSocket';
import { authService } from '@/services/authService';
import type { User } from '@/types';

// ❌ Evitar - Imports relativos largos
import { UserProfile } from '../../../components/UserProfile';
```

### **Estructura de Componentes**
```typescript
// 1. Imports
import React from 'react';
import type { ComponentProps } from '@/types';

// 2. Tipos
interface Props extends ComponentProps {
  // props específicas
}

// 3. Componente
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => {};
  
  // 6. Render
  return <div>Content</div>;
};
```

## 🚀 Scripts Disponibles

### **Desarrollo**
```bash
npm run dev              # Solo frontend
npm run dev:server       # Solo backend
npm run dev:full         # Frontend + Backend
```

### **Build**
```bash
npm run build            # Solo frontend
npm run build:server     # Solo backend
npm run build:full       # Frontend + Backend
```

### **Utilidades**
```bash
npm run type-check       # Verificar tipos TypeScript
npm run lint             # Linting
npm run lint:fix         # Linting + auto-fix
npm run clean            # Limpiar cache
npm run analyze          # Analizar bundle
```

## 🔧 Configuraciones Importantes

### **TypeScript (tsconfig.json)**
- Target: ES2022
- Strict mode habilitado
- Path mapping optimizado
- Incluye server y frontend

### **Vite (vite.config.ts)**
- Sourcemaps habilitados
- Aliases configurados
- Chunk splitting optimizado
- HMR configurado

### **Tailwind CSS**
- Configuración personalizada
- Variables CSS para tema Discord
- Componentes predefinidos

## 📝 Mejores Prácticas

### **1. Manejo de Estado**
```typescript
// ✅ Usar Context API para estado global
const { user, setUser } = useContext(AuthContext);

// ✅ Usar useState para estado local
const [isLoading, setIsLoading] = useState(false);
```

### **2. Manejo de Errores**
```typescript
// ✅ Usar try-catch con logging
try {
  await apiCall();
} catch (error) {
  logger.error('Error en apiCall:', error);
  // Manejar error apropiadamente
}
```

### **3. Performance**
```typescript
// ✅ Usar React.memo para componentes pesados
export const HeavyComponent = React.memo(({ data }) => {
  return <div>{/* contenido */}</div>;
});

// ✅ Usar useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

### **4. TypeScript**
```typescript
// ✅ Definir tipos explícitos
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Usar tipos genéricos
const [users, setUsers] = useState<User[]>([]);
```

## 🎨 Estilos y UI

### **Variables CSS Disponibles**
```css
/* Colores Discord */
--discord-bg: #36393f;
--discord-accent: #5865f2;
--discord-success: #57f287;
--discord-warning: #faa61a;
--discord-danger: #ed4245;

/* Espaciado */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
```

### **Componentes Predefinidos**
```css
/* Botones */
.btn, .btn-secondary, .btn-ghost

/* Inputs */
.input, .input-sm, .input-lg

/* Cards */
.card, .card-header, .card-title

/* Estados */
.status-dot.connected, .status-dot.disconnected
```

## 🔌 Integración Backend

### **Socket.IO Events**
```typescript
// Cliente
socket.emit('join-lobby', { userId });
socket.on('user-joined', (user) => {});

// Servidor
socket.on('join-lobby', (data) => {});
socket.emit('user-joined', user);
```

### **API Endpoints**
```typescript
// Auth
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout

// Users
GET /api/users
GET /api/users/:id
PUT /api/users/:id
```

## 🚨 Debugging

### **Logging**
```typescript
import { logger } from '@/utils/logger';

logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

### **Herramientas de Desarrollo**
- React DevTools
- Redux DevTools (si se usa)
- Network tab para API calls
- Console para logs

## 📚 Recursos Adicionales

- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Socket.IO](https://socket.io/docs/)
- [Vite](https://vitejs.dev/guide/)

---

**💡 Consejo**: Siempre verifica los tipos TypeScript y usa el sistema de paths para imports más limpios y mantenibles. 