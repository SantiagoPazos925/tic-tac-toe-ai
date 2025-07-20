import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        // Optimización de chunks para móviles
        manualChunks: {
          // Chunk principal con React
          vendor: ['react', 'react-dom'],
          
          // Chunk de Socket.io (cargado solo cuando sea necesario)
          socket: ['socket.io-client'],
          
          // Chunk de animaciones (solo en desktop)
          motion: ['framer-motion'],
          
          // Chunk de emojis (cargado bajo demanda)
          emoji: ['emoji-picker-react'],
        },
        
        // Optimización de nombres de archivos
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        // Optimización de assets
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // Optimización de treeshaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    
    // Optimización de CSS
    cssCodeSplit: true,
    
    // Optimización de assets
    assetsInlineLimit: 4096, // 4KB
    
    // Optimización de source maps
    sourcemap: false,
    
    // Optimización de reporte de bundle
    reportCompressedSize: true,
    
    // Optimización de chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimización de desarrollo
  server: {
    port: 3000,
    host: true,
  },
  
  // Optimización de preview
  preview: {
    port: 4173,
    host: true,
  },
  
  // Optimización de resolución
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  
  // Optimización de CSS
  css: {
    devSourcemap: false,
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
    ],
    exclude: [
      'socket.io-client', // Excluir para carga diferida
      'emoji-picker-react', // Excluir para carga diferida
      'framer-motion', // Excluir para carga diferida
    ],
  },
  
  // Optimización de define
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})
