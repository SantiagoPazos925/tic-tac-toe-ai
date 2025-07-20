import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import ViteImageOptimizer from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      mozjpeg: {
        quality: 80,
        progressive: true
      },
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeTitle: false,
                removeDesc: false
              }
            }
          }
        ]
      },
      webp: {
        quality: 80
      }
    })
  ],
  root: '.',
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false, // Deshabilitar sourcemaps en producción para mejor rendimiento
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunks optimizados para mejor caching
          vendor: ['react', 'react-dom'],
          socket: ['socket.io-client'],
          motion: ['motion/react'],
          emoji: ['emoji-picker-react'],
          utils: ['@/utils/logger', '@/utils/formatters', '@/utils/performance'],
          // Separar componentes pesados
          components: [
            '@/components/AuthForm',
            '@/components/ChatSection',
            '@/components/UsersList'
          ]
        },
        // Optimizar nombres de archivos para caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
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
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Optimizaciones adicionales
    target: 'es2015',
    assetsInlineLimit: 4096, // Inline assets pequeños
    cssCodeSplit: true,
    reportCompressedSize: false // Mejorar velocidad de build
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/contexts': resolve(__dirname, './src/contexts'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/styles': resolve(__dirname, './src/styles')
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'socket.io-client', 
      'motion/react',
      'emoji-picker-react'
    ],
    exclude: ['@vitejs/plugin-react']
  },
  server: {
    hmr: {
      overlay: false
    },
    port: 5173,
    host: true,
    open: true
  },
  preview: {
    port: 4173,
    host: true
  },
  // Optimizaciones para desarrollo
  esbuild: {
    drop: ['console', 'debugger']
  }
});
