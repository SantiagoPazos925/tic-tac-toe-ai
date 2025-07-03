Write-Host "🚀 Iniciando deploy en Fly.io..." -ForegroundColor Green

# Verificar si Fly CLI está instalado
try {
    fly --version | Out-Null
    Write-Host "✅ Fly CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Fly CLI no está instalado. Instalando..." -ForegroundColor Red
    Write-Host "Ejecutando: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://fly.io/install.ps1" -UseBasicParsing | Invoke-Expression
    Write-Host "✅ Fly CLI instalado. Por favor, reinicia tu terminal y ejecuta este script nuevamente." -ForegroundColor Green
    exit 1
}

# Verificar si el usuario está logueado
try {
    fly auth whoami | Out-Null
    Write-Host "✅ Usuario autenticado" -ForegroundColor Green
} catch {
    Write-Host "🔐 Iniciando login en Fly.io..." -ForegroundColor Yellow
    fly auth login
}

# Navegar al directorio del servidor
Set-Location server

# Deploy
Write-Host "📦 Haciendo deploy..." -ForegroundColor Yellow
fly deploy

Write-Host "✅ Deploy completado!" -ForegroundColor Green
Write-Host "🌐 Tu aplicación está disponible en: https://tic-tac-toe-ai-server.fly.dev" -ForegroundColor Cyan
Write-Host "📊 Para ver logs: fly logs" -ForegroundColor Cyan
Write-Host "🔧 Para escalar: fly scale count 1" -ForegroundColor Cyan 