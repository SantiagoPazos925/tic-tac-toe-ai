FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (sin ejecutar postinstall/build)
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir TypeScript
RUN npm run build

# Instalar solo dependencias de producción y limpiar las de desarrollo
RUN npm prune --production

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["npm", "start"] 