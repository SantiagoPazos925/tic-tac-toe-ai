#!/bin/bash

echo "🚀 Iniciando deploy en Fly.io..."

# Verificar si Fly CLI está instalado
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI no está instalado. Instalando..."
    curl -L https://fly.io/install.sh | sh
    echo "✅ Fly CLI instalado. Por favor, reinicia tu terminal y ejecuta este script nuevamente."
    exit 1
fi

# Verificar si el usuario está logueado
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Iniciando login en Fly.io..."
    fly auth login
fi

# Navegar al directorio del servidor
cd server

# Deploy
echo "📦 Haciendo deploy..."
fly deploy

echo "✅ Deploy completado!"
echo "🌐 Tu aplicación está disponible en: https://tic-tac-toe-ai-server.fly.dev"
echo "📊 Para ver logs: fly logs"
echo "🔧 Para escalar: fly scale count 1" 