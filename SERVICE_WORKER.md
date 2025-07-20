# 🔧 Service Worker - Documentación Completa

## 📋 Resumen

Se ha implementado un Service Worker completo para la aplicación Tic-Tac-Toe AI que proporciona:

- **Cache offline** para recursos estáticos y dinámicos
- **Sincronización en segundo plano** para datos offline
- **Notificaciones push** (preparado para futuras implementaciones)
- **Indicadores visuales** de estado offline y actualizaciones
- **Almacenamiento local** con IndexedDB

## 🏗️ Arquitectura

### Archivos Implementados

```
├── public/
│   ├── sw.js                    # Service Worker principal
│   └── manifest.json            # Manifest de PWA
├── src/
│   ├── hooks/
│   │   └── useServiceWorker.ts  # Hook para manejo del SW
│   ├── components/
│   │   └── OfflineIndicator.tsx # Indicadores visuales
│   └── services/
│       └── offlineStorage.ts    # Almacenamiento IndexedDB
```

## 🔄 Estrategias de Cache

### 1. **Cache First**
- **Aplicación**: Recursos estáticos (CSS, JS, fuentes)
- **Comportamiento**: Sirve desde cache, actualiza en segundo plano
- **Ventaja**: Carga instantánea de recursos críticos

### 2. **Network First**
- **Aplicación**: APIs y datos dinámicos
- **Comportamiento**: Intenta red, fallback a cache
- **Ventaja**: Datos siempre actualizados cuando hay conexión

### 3. **Stale While Revalidate**
- **Aplicación**: Imágenes y recursos que pueden estar desactualizados
- **Comportamiento**: Sirve cache inmediatamente, actualiza en segundo plano
- **Ventaja**: Balance entre velocidad y actualización

## 📦 Almacenamiento Offline

### IndexedDB Structure

```typescript
// Store: messages
{
  id: string;
  content: string;
  timestamp: number;
  userId: string;
  type: 'user' | 'system';
  synced: boolean;
}

// Store: users
{
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
}

// Store: config
{
  key: string;
  value: any;
}
```

### Funciones Principales

```typescript
// Guardar mensaje offline
await offlineStorage.saveMessage({
  content: "Hola mundo",
  timestamp: Date.now(),
  userId: "user123",
  type: "user"
});

// Obtener mensajes no sincronizados
const unsynced = await offlineStorage.getUnsyncedMessages();

// Marcar como sincronizado
await offlineStorage.markMessageAsSynced(messageId);
```

## 🎯 Hook useServiceWorker

### Estado Disponible

```typescript
const {
  isSupported,      // Soporte del navegador
  isInstalled,      // SW instalado
  isUpdated,        // Nueva versión disponible
  isOffline,        // Estado de conexión
  registration,     // Registro del SW
} = useServiceWorker();
```

### Acciones Disponibles

```typescript
const {
  register,         // Registrar SW
  update,           // Buscar actualizaciones
  unregister,       // Desinstalar SW
  skipWaiting,      // Activar nueva versión
} = useServiceWorker();
```

## 🎨 Componentes Visuales

### OfflineIndicator

Muestra automáticamente:
- **Indicador offline** cuando no hay conexión
- **Notificación de actualización** cuando hay nueva versión
- **Indicador de app instalada** cuando está disponible

### ServiceWorkerInfo

Panel informativo con:
- Estado del Service Worker
- Estado de conexión
- Botones de control
- Estadísticas de almacenamiento

## 🔔 Notificaciones Push

### Configuración (Preparado)

```typescript
// Solicitar permisos
const { requestPermission, subscribe } = usePushNotifications();

// Suscribirse a notificaciones
await subscribe();
```

### Manejo de Notificaciones

```javascript
// En el Service Worker
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    actions: [
      { action: 'explore', title: 'Ver' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tic-Tac-Toe AI', options)
  );
});
```

## 📊 Métricas y Monitoreo

### Estadísticas de Almacenamiento

```typescript
const stats = await offlineStorage.getStorageStats();
// {
//   messages: 150,
//   users: 25,
//   config: 5,
//   totalSize: 180
// }
```

### Logging Estructurado

```typescript
Logger.info('Service Worker registrado exitosamente');
Logger.warn('Conexión perdida - Modo offline activado');
Logger.error('Error en sincronización', error);
```

## 🚀 Instalación y Configuración

### 1. **Registro Automático**

El Service Worker se registra automáticamente al cargar la aplicación:

```typescript
// En useServiceWorker.ts
useEffect(() => {
  if (state.isSupported && !state.isInstalled) {
    register();
  }
}, [state.isSupported, state.isInstalled, register]);
```

### 2. **Manifest PWA**

```json
{
  "name": "Tic-Tac-Toe AI - Lobby de Juegos",
  "short_name": "TicTacToe AI",
  "display": "standalone",
  "theme_color": "#5865f2",
  "background_color": "#36393f"
}
```

### 3. **Meta Tags**

```html
<meta name="theme-color" content="#5865f2" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<link rel="manifest" href="/manifest.json" />
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```typescript
// Cache names
const CACHE_NAME = 'tic-tac-toe-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Archivos estáticos
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];
```

### Personalización de Estrategias

```javascript
// En sw.js
function isStaticResource(url) {
  return url.pathname.startsWith('/assets/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js');
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.pathname.startsWith('/socket.io/');
}
```

## 🧪 Testing

### Verificar Instalación

1. Abrir DevTools → Application → Service Workers
2. Verificar que el SW esté registrado y activo
3. Revisar los caches creados

### Probar Modo Offline

1. Desconectar internet
2. Recargar la página
3. Verificar que la app funcione offline
4. Comprobar indicadores visuales

### Verificar Sincronización

1. Enviar mensajes offline
2. Reconectar internet
3. Verificar que los mensajes se sincronicen

## 📈 Beneficios Implementados

### Performance
- **Carga instantánea** de recursos estáticos
- **Reducción de requests** de red
- **Mejor experiencia** en conexiones lentas

### Experiencia de Usuario
- **Funcionamiento offline** completo
- **Indicadores visuales** claros
- **Actualizaciones automáticas** sin interrupciones

### Mantenibilidad
- **Código modular** y reutilizable
- **Logging estructurado** para debugging
- **Configuración centralizada**

## 🔮 Próximas Mejoras

### 1. **Background Sync**
```javascript
// Implementar sincronización en segundo plano
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('background-sync');
});
```

### 2. **Push Notifications**
```javascript
// Configurar VAPID keys
const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
```

### 3. **Analytics Offline**
```javascript
// Guardar eventos offline para enviar después
await offlineStorage.saveConfig('analytics', events);
```

### 4. **Cache Invalidation**
```javascript
// Estrategia más sofisticada para invalidar cache
function shouldInvalidateCache(request, response) {
  // Lógica personalizada
}
```

## 📚 Recursos Adicionales

- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) 