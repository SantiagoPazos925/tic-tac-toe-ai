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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          socket: ['socket.io-client'],
          motion: ['motion/react'],
          emoji: ['emoji-picker-react'],
          utils: ['@/utils/logger', '@/utils/formatters', '@/utils/performance']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Mantener console para debugging
        drop_debugger: true
      }
    }
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
    include: ['react', 'react-dom', 'socket.io-client', 'motion/react']
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
  }
});
