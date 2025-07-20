# Solución Error CORS - Desarrollo Local

## 🚨 Problema Identificado

El frontend local (`http://localhost:3000`) estaba intentando conectarse al backend desplegado en Railway (`https://tic-tac-toe-ai-production-13d0.up.railway.app`), causando errores de CORS.

### Errores en Consola:
```
Access to link element resource at 'https://tic-tac-toe-ai-production-13d0.up.railway.app/socket.io/' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## ✅ Solución Implementada

### 1. Configuración Condicional de URLs

**Archivo**: `src/services/socketService.ts`
```typescript
constructor() {
    // En desarrollo, siempre usar localhost:3001
    if (import.meta.env.DEV) {
        this.baseUrl = 'http://localhost:3001';
    } else {
        // En producción, usar la variable de entorno
        this.baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:3001';
    }
    
    console.log('🔍 DEBUG: SocketService usando URL:', this.baseUrl);
}
```

**Archivo**: `src/services/authService.ts`
```typescript
constructor() {
    // En desarrollo, siempre usar localhost:3001
    if (import.meta.env.DEV) {
        this.baseUrl = 'http://localhost:3001';
    } else {
        // En producción, usar la variable de entorno
        this.baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:3001';
    }
    
    console.log('🔍 DEBUG: AuthService usando URL:', this.baseUrl);
}
```

### 2. Configuración CORS del Backend

**Archivo**: `server/config/index.ts`
```typescript
// Configuración de CORS
export const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Permitir requests sin origin (como aplicaciones móviles o Postman)
        if (!origin) return callback(null, true);
        
        // En desarrollo, permitir cualquier origin localhost
        if (serverConfig.environment === 'development' && origin.includes('localhost')) {
            return callback(null, true);
        }
        
        // En producción, verificar contra la lista de origins permitidos
        if (serverConfig.corsOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204
};
```

## 🔧 Configuración de Entornos

### Desarrollo Local
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3001`
- **Configuración**: Automática (usa `import.meta.env.DEV`)

### Producción (Railway)
- **Frontend**: `https://tic-tac-toe-ai-ochre.vercel.app`
- **Backend**: `https://tic-tac-toe-ai-production-13d0.up.railway.app`
- **Configuración**: Variable de entorno `VITE_API_URL`

## 🚀 Script de Reinicio

**Archivo**: `clean-restart.bat`
```batch
@echo off
echo Limpiando caché y reiniciando servidor de desarrollo...
# ... (ver archivo completo)
```

### Uso:
1. Ejecutar `clean-restart.bat`
2. Esperar a que se reinicien ambos servidores
3. Verificar que no hay errores de CORS

## 🔍 Verificación

### 1. Verificar Backend Local
```bash
curl http://localhost:3001/health
```

### 2. Verificar Frontend Local
```bash
curl http://localhost:3000
```

### 3. Verificar Conexión Socket
- Abrir DevTools (F12)
- Ir a la pestaña Console
- Buscar logs: "🔍 DEBUG: SocketService usando URL: http://localhost:3001"

## 📋 Checklist de Verificación

- [ ] Backend corriendo en `localhost:3001`
- [ ] Frontend corriendo en `localhost:3000`
- [ ] No errores de CORS en consola
- [ ] Socket.io conectando correctamente
- [ ] Usuarios apareciendo en la lista
- [ ] Botón de cambio de estado funcionando

## 🛠️ Troubleshooting

### Si persisten errores de CORS:

1. **Limpiar caché del navegador**:
   - Ctrl + Shift + R (hard refresh)
   - O abrir en modo incógnito

2. **Verificar puertos**:
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

3. **Reiniciar servidores**:
   ```bash
   # Backend
   cd server && npm run dev
   
   # Frontend (en otra terminal)
   npm run dev
   ```

4. **Verificar variables de entorno**:
   - No debe haber archivos `.env` con `VITE_API_URL` apuntando a Railway

## 🎯 Resultado Esperado

- ✅ Sin errores de CORS en consola
- ✅ Conexión Socket.io establecida
- ✅ Usuarios apareciendo en la lista
- ✅ Funcionalidad completa del lobby
- ✅ Cambio de estado funcionando 