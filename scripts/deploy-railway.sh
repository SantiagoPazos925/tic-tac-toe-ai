#!/bin/bash

# Script de deploy automático para Railway
# Ejecutar: ./scripts/deploy-railway.sh

echo "🚄 Iniciando deploy en Railway..."

# Verificar si Railway CLI está instalado
if command -v railway &> /dev/null; then
    RAILWAY_VERSION=$(railway --version)
    echo "✅ Railway CLI encontrado: $RAILWAY_VERSION"
else
    echo "❌ Railway CLI no encontrado. Instalando..."
    npm install -g @railway/cli
fi

# Verificar si el usuario está logueado
if railway whoami &> /dev/null; then
    USER=$(railway whoami)
    echo "✅ Usuario logueado: $USER"
else
    echo "🔐 Iniciando login en Railway..."
    railway login
fi

# Inicializar proyecto si no existe
if [ ! -d ".railway" ]; then
    echo "📁 Inicializando proyecto en Railway..."
    railway init
fi

# Deploy
echo "🚀 Iniciando deploy..."
railway up

# Obtener URL del despliegue
echo "🌐 Obteniendo URL del despliegue..."
DOMAIN=$(railway domain)
echo "✅ Aplicación desplegada en: $DOMAIN"

# Mostrar logs
echo "📊 Mostrando logs..."
railway logs

echo "🎉 ¡Deploy completado!"
echo "🌐 Tu aplicación está disponible en: $DOMAIN" 