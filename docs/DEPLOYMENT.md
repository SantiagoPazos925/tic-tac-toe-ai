# 🚀 Guía de Despliegue - Tic-Tac-Toe Online

Esta guía te ayudará a desplegar tu juego multijugador en la nube para que otros puedan jugar desde cualquier lugar.

## 🌐 Opciones de Hosting Recomendadas

### **Opción 1: Railway (Recomendado)**

#### **Frontend (Vercel) - GRATIS**
1. **Crea una cuenta** en [vercel.com](https://vercel.com)
2. **Conecta tu repositorio** de GitHub
3. **Configura las variables de entorno**:
   ```
   VITE_SOCKET_URL=https://tu-servidor.railway.app
   ```
4. **Despliega** automáticamente

#### **Backend (Railway) - $5/mes**
1. **Crea una cuenta** en [railway.app](https://railway.app)
2. **Conecta tu repositorio** de GitHub
3. **Selecciona la carpeta `server`** como proyecto
4. **Configura las variables de entorno**:
   ```
   PORT=3001
   NODE_ENV=production
   ```
5. **Despliega** automáticamente

## 📋 Pasos Previos al Despliegue

### **1. Preparar el repositorio**
```bash
# Asegúrate de que todo esté committeado
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

### **2. Verificar la estructura**
```
tic-tac-toe-ai/
├── components/          # Frontend
├── hooks/              # Frontend
├── server/             # Backend
│   ├── index.ts        # Servidor principal
│   ├── package.json    # Dependencias del servidor
│   ├── tsconfig.json   # Configuración TypeScript
│   └── Procfile        # Para Heroku/Railway
├── package.json        # Dependencias del frontend
└── vite.config.ts      # Configuración Vite
```

## 🔧 Configuración Detallada

### **Vercel (Frontend)**

1. **Ve a** [vercel.com](https://vercel.com) y crea una cuenta
2. **Haz clic en "New Project"**
3. **Importa tu repositorio** de GitHub
4. **Configura el proyecto**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Agrega variables de entorno**:
   - `VITE_SOCKET_URL`: `https://tu-servidor.railway.app`
6. **Haz clic en "Deploy"**

### **Railway (Backend)**

1. **Ve a** [railway.app](https://railway.app) y crea una cuenta
2. **Haz clic en "New Project"**
3. **Selecciona "Deploy from GitHub repo"**
4. **Selecciona tu repositorio**
5. **Configura el servicio**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. **Agrega variables de entorno**:
   - `PORT`: `3001`
   - `NODE_ENV`: `production`
7. **Haz clic en "Deploy"**

## 🌍 URLs de Producción

Después del despliegue, tendrás URLs como:
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-servidor.railway.app`

## 🔄 Actualizar Variables de Entorno

### **En Vercel:**
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Actualiza `VITE_SOCKET_URL` con la URL de tu backend
4. **Redeploy** automáticamente

### **En Railway:**
1. Ve a tu proyecto en Railway
2. **Variables** → **New Variable**
3. Agrega las variables necesarias
4. **Redeploy** automáticamente

## 🧪 Probar el Despliegue

1. **Abre** la URL de tu frontend
2. **Crea una sala** nueva
3. **Comparte el código** con alguien
4. **Verifica** que puedan jugar juntos

## 🐛 Solución de Problemas

### **Error de CORS**
Si ves errores de CORS, asegúrate de que en `server/index.ts`:
```typescript
const io = new Server(httpServer, {
  cors: {
    origin: ["https://tu-app.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});
```

### **Error de Conexión**
Verifica que:
1. La URL del backend esté correcta en las variables de entorno
2. El backend esté ejecutándose
3. No haya firewalls bloqueando la conexión

### **Error de Build**
Si hay errores de build:
1. Verifica que todas las dependencias estén instaladas
2. Asegúrate de que TypeScript compile correctamente
3. Revisa los logs de build en la plataforma

## 💰 Costos Estimados

- **Vercel**: Gratis (hasta 100GB/mes)
- **Railway**: $5/mes (muy económico)

## 🎯 Próximos Pasos

Una vez desplegado, puedes:
1. **Compartir la URL** con amigos
2. **Agregar un dominio personalizado**
3. **Implementar autenticación**
4. **Agregar más funcionalidades**

¡Tu juego estará disponible para todo el mundo! 🌍🎮 

git commit -m "Primer commit: Tic-Tac-Toe multijugador listo para deploy" 