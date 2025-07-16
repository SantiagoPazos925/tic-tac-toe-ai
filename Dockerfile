# Dockerfile para Railway - Template Backend
FROM node:20-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY server/package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar archivos de configuración
COPY server/tsconfig.json ./

# Copiar código fuente
COPY server/ ./

# Construir la aplicación TypeScript
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicio
CMD ["npm", "start"] 