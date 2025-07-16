# Dockerfile para Railway - Template Backend
FROM node:20-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del servidor
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Instalar dependencias del servidor
RUN npm ci --omit=dev

# Copiar código fuente del servidor
COPY server/ ./

# Construir el servidor
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicio
CMD ["npm", "start"] 