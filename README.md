# 🚀 Template Frontend + Backend

Un template limpio y moderno para desarrollar aplicaciones web con:
- **Frontend**: React + TypeScript + Vite (desplegado en Vercel)
- **Backend**: Node.js + Express + TypeScript (desplegado en Railway)

## 📁 Estructura del Proyecto

```
├── src/                    # Frontend (Vercel)
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── server/                 # Backend (Railway)
│   ├── index.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json           # Frontend dependencies
├── vite.config.ts
├── tsconfig.json
├── Dockerfile            # Para Railway
└── railway.json          # Configuración Railway
```

## 🚀 Despliegue

### Backend en Railway

1. **Conecta tu repositorio a Railway**
2. **Configura el directorio de construcción**: `server/`
3. **Variables de entorno** (opcional):
   - `PORT`: Puerto del servidor (Railway lo asigna automáticamente)
   - `NODE_ENV`: `production`

### Frontend en Vercel

1. **Conecta tu repositorio a Vercel**
2. **Configuración automática** - Vercel detectará que es un proyecto Vite
3. **Variables de entorno** (opcional):
   - `VITE_API_URL`: URL de tu backend de Railway

## 🛠️ Desarrollo Local

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

## 📝 Próximos Pasos

1. **Actualiza la URL del backend** en `src/App.tsx` con tu URL de Railway
2. **Agrega tus rutas API** en `server/index.ts`
3. **Crea tus componentes** en `src/`
4. **¡Desarrolla tu aplicación!** 🎉

## 🔧 Tecnologías

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Despliegue**: Vercel (Frontend), Railway (Backend)
- **Contenedores**: Docker

## 📚 Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
