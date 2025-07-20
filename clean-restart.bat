@echo off
echo Limpiando caché y reiniciando servidor de desarrollo...
echo.

echo 1. Deteniendo procesos de Node.js...
taskkill /f /im node.exe 2>nul
echo.

echo 2. Limpiando caché de npm...
npm cache clean --force
echo.

echo 3. Eliminando node_modules...
rmdir /s /q node_modules 2>nul
echo.

echo 4. Reinstalando dependencias...
npm install
echo.

echo 5. Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && npm run dev"
echo.

echo 6. Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak >nul
echo.

echo 7. Iniciando servidor frontend...
start "Frontend Server" cmd /k "npm run dev"
echo.

echo ¡Servidores iniciados! 
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul 