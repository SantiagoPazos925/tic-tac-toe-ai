# Dockerfile para Railway - Tic Tac Toe AI
FROM node:20-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Instalar dependencias del frontend
RUN npm ci --omit=dev

# Copiar código fuente del frontend
COPY . .

# Construir el frontend
RUN npm run build

# Etapa del servidor
FROM node:20-alpine AS server

WORKDIR /app

# Copiar package.json del servidor
COPY server/package*.json ./

# Instalar dependencias del servidor
RUN npm ci --omit=dev

# Copiar código del servidor y la carpeta dist generada localmente
COPY server/dist ./dist
COPY server/package.json ./

# Etapa final
FROM node:20-alpine AS production

WORKDIR /app

# Copiar package.json del servidor como package.json principal
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copiar archivos construidos
COPY --from=server /app/dist ./dist
COPY --from=base /app/dist ./public

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicio
CMD ["npm", "start"] 