# Tic-Tac-Toe Server (Backend)

Este backend está listo para ser desplegado en Railway sin Dockerfile ni builds pesados.

## 🚀 Despliegue en Railway

1. **Asegúrate de tener la carpeta `dist` generada localmente:**
   ```bash
   npm install
   npm run build
   ```
   Esto generará el código compilado en `dist/`.

2. **Sube esta carpeta (`server/`) como un repositorio independiente a GitHub.**

3. **En Railway:**
   - Crea un nuevo proyecto.
   - Elige "Deploy from GitHub repo".
   - Selecciona este repositorio.
   - Railway detectará automáticamente el `package.json` y usará el script `start`.

4. **¡Listo!**
   - Tu backend estará online en Railway.

## 📦 Scripts disponibles
- `npm run build` — Compila TypeScript a JavaScript en `dist/`
- `npm start` — Ejecuta el servidor desde `dist/index.js`

## ⚠️ Notas
- **No necesitas Dockerfile ni railway.json**
- **No subas la carpeta `node_modules` ni archivos innecesarios**
- El build de TypeScript debe hacerse localmente antes de subir a Railway 