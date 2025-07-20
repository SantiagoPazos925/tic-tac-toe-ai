import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuración específica para desarrollo
export default defineConfig({
  plugins: [react()],
  
  // Forzar variables de entorno para desarrollo
  define: {
    'import.meta.env.DEV': true,
    'import.meta.env.VITE_API_URL': '"http://localhost:3001"',
  },
  
  server: {
    port: 3000,
    host: true,
  },
  
  // Configuración de desarrollo
  mode: 'development',
  
  // Logs de debug
  logLevel: 'info',
  
  // Configuración de build para desarrollo
  build: {
    sourcemap: true,
    minify: false,
  }
}) 