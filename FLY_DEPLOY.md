# 🚀 Deploy en Fly.io

## Configuración para Tic-Tac-Toe AI

### 📋 Prerrequisitos

1. **Cuenta en Fly.io**: [fly.io](https://fly.io)
2. **GitHub conectado** a tu cuenta de Fly.io
3. **Fly CLI** instalado

### 🔧 Instalación de Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# macOS/Linux
curl -L https://fly.io/install.sh | sh
```

### 🚀 Deploy Automático

#### Opción 1: Script Automático
```bash
# Dar permisos de ejecución
chmod +x deploy-fly.sh

# Ejecutar deploy
./deploy-fly.sh
```

#### Opción 2: Deploy Manual

1. **Login en Fly.io**:
```bash
fly auth login
```

2. **Navegar al directorio del servidor**:
```bash
cd server
```

3. **Hacer deploy**:
```bash
fly deploy
```

### ⚙️ Configuración

#### Variables de Entorno
```bash
fly secrets set PORT=3001
fly secrets set NODE_ENV=production
```

#### Escalar la Aplicación
```bash
# Ver instancias actuales
fly status

# Escalar a 1 instancia (gratis)
fly scale count 1

# Ver logs
fly logs
```

### 🌐 URLs

- **Aplicación**: https://tic-tac-toe-ai-server.fly.dev
- **Dashboard**: https://fly.io/apps/tic-tac-toe-ai-server

### 📊 Monitoreo

```bash
# Ver logs en tiempo real
fly logs --follow

# Ver estado de la aplicación
fly status

# Ver métricas
fly dashboard
```

### 🔧 Comandos Útiles

```bash
# Reiniciar aplicación
fly restart

# Ver información de la app
fly info

# Abrir aplicación en el navegador
fly open

# Destruir aplicación
fly destroy
```

### 💰 Plan Gratuito

- **3 VMs pequeñas** (256MB RAM cada una)
- **160GB transferencia** mensual
- **3GB almacenamiento**
- **SSL automático**
- **Sin expiración**

### 🎯 Ventajas para Argentina

- **Servidores en São Paulo** (latencia ~30-50ms)
- **WebSockets nativos**
- **Auto-scaling**
- **Load balancing incluido**

### 🚨 Solución de Problemas

#### Error de Puerto
Si hay problemas con el puerto, verifica:
```bash
fly logs
```

#### Error de Memoria
Para aplicaciones con más memoria:
```bash
fly scale memory 512
```

#### Error de Conexión
Verifica que el CORS esté configurado correctamente en `server/index.ts`:
```typescript
cors: {
    origin: [
        "http://localhost:5173",
        "https://tu-frontend.vercel.app"
    ],
    methods: ["GET", "POST"]
}
```

### 📞 Soporte

- **Documentación**: [fly.io/docs](https://fly.io/docs)
- **Comunidad**: [fly.io/community](https://fly.io/community)
- **Discord**: [fly.io/discord](https://fly.io/discord) 