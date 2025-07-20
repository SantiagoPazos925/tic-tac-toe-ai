@echo off
echo ========================================
echo LIMPIEZA COMPLETA - SOLUCION CORS
echo ========================================
echo.

echo 1. Deteniendo TODOS los procesos de Node.js...
taskkill /f /im node.exe 2>nul
echo ✓ Procesos detenidos
echo.

echo 2. Limpiando caché de npm...
npm cache clean --force
echo ✓ Caché npm limpiado
echo.

echo 3. Eliminando node_modules...
rmdir /s /q node_modules 2>nul
echo ✓ node_modules eliminado
echo.

echo 4. Eliminando dist...
rmdir /s /q dist 2>nul
echo ✓ dist eliminado
echo.

echo 5. Reinstalando dependencias...
npm install
echo ✓ Dependencias reinstaladas
echo.

echo 6. Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && npm run dev"
echo ✓ Backend iniciado
echo.

echo 7. Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak >nul
echo ✓ Espera completada
echo.

echo 8. Iniciando servidor frontend...
start "Frontend Server" cmd /k "npm run dev"
echo ✓ Frontend iniciado
echo.

echo ========================================
echo ¡LIMPIEZA COMPLETA FINALIZADA!
echo ========================================
echo.
echo INSTRUCCIONES:
echo 1. Abre http://localhost:3000 en modo incógnito
echo 2. Presiona Ctrl+Shift+R para hard refresh
echo 3. Verifica que no hay errores de CORS
echo 4. Busca en consola: "SocketService usando URL: http://localhost:3001"
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul 