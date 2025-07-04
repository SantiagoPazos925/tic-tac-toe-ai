# Script de deploy automático para Railway
# Ejecutar: .\scripts\deploy-railway.ps1

Write-Host "🚄 Iniciando deploy en Railway..." -ForegroundColor Green

# Verificar si Railway CLI está instalado
try {
    $railwayVersion = & railway --version 2>$null
    if ($railwayVersion) {
        Write-Host "✅ Railway CLI encontrado: $railwayVersion" -ForegroundColor Green
    } else {
        throw "Railway CLI no encontrado"
    }
} catch {
    Write-Host "❌ Railway CLI no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Verificar si el usuario está logueado
try {
    $user = & railway whoami 2>$null
    if ($user) {
        Write-Host "✅ Usuario logueado: $user" -ForegroundColor Green
    } else {
        throw "Usuario no logueado"
    }
} catch {
    Write-Host "🔐 Iniciando login en Railway..." -ForegroundColor Yellow
    railway login
}

# Inicializar proyecto si no existe
if (-not (Test-Path ".railway")) {
    Write-Host "📁 Inicializando proyecto en Railway..." -ForegroundColor Yellow
    railway init
}

# Deploy
Write-Host "🚀 Iniciando deploy..." -ForegroundColor Green
railway up

# Obtener URL del despliegue
Write-Host "🌐 Obteniendo URL del despliegue..." -ForegroundColor Green
$domain = railway domain
Write-Host "✅ Aplicación desplegada en: $domain" -ForegroundColor Green

# Mostrar logs
Write-Host "📊 Mostrando logs..." -ForegroundColor Green
railway logs

Write-Host "🎉 ¡Deploy completado!" -ForegroundColor Green
Write-Host "🌐 Tu aplicación está disponible en: $domain" -ForegroundColor Cyan 