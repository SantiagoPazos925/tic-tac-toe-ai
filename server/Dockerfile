FROM node:18-alpine

WORKDIR /app

# Copiar todo el código fuente y archivos de configuración
COPY . .

# Instalar dependencias
RUN npm install

# Construir TypeScript
RUN npm run build

# Instalar solo dependencias de producción y limpiar las de desarrollo
RUN npm prune --production

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["npm", "start"] 