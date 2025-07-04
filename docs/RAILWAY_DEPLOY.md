# Despliegue en Railway

Este proyecto está configurado para desplegarse en Railway, una plataforma de despliegue moderna y fácil de usar.

## Configuración Actual

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.io
- **Docker**: Multi-stage build optimizado
- **Puerto**: 3001 (configurado automáticamente por Railway)

## Pasos para Desplegar

### 1. Instalar Railway CLI (opcional)
```bash
npm install -g @railway/cli
```

### 2. Conectar con Railway
```bash
railway login
```

### 3. Inicializar proyecto
```bash
railway init
```

### 4. Desplegar
```bash
railway up
```

### 5. Obtener URL del despliegue
```bash
railway domain
```

## Configuración Automática

Railway detectará automáticamente:
- El Dockerfile en la raíz del proyecto
- El puerto 3001 configurado
- Las variables de entorno necesarias

## Variables de Entorno

Railway configurará automáticamente:
- `PORT`: Puerto del servidor (Railway lo asigna)
- `RAILWAY_PUBLIC_DOMAIN`: Dominio público de la aplicación
- `NODE_ENV`: production

## Health Check

La aplicación incluye un endpoint de health check en `/health` que Railway usará para verificar que la aplicación esté funcionando correctamente.

## Ventajas de Railway

1. **Configuración más simple**: No requiere archivos de configuración complejos
2. **Detección automática**: Detecta automáticamente el tipo de aplicación
3. **Mejor UI**: Interfaz web más intuitiva
4. **Despliegue más rápido**: Proceso de build optimizado
5. **Mejor documentación**: Más recursos y ejemplos disponibles

## Monitoreo

Una vez desplegado, puedes:
- Ver logs en tiempo real desde la interfaz web
- Monitorear el uso de recursos
- Configurar alertas automáticas
- Ver métricas de rendimiento

## Troubleshooting

### Error de build
- Verificar que el Dockerfile esté en la raíz del proyecto
- Asegurar que todas las dependencias estén en package.json

### Error de conexión WebSocket
- Verificar que el CORS esté configurado correctamente
- Asegurar que el dominio de Railway esté en la lista de orígenes permitidos

### Error de puerto
- Railway asignará automáticamente el puerto, no es necesario configurarlo manualmente 