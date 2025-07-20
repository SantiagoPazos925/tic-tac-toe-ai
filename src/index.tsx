
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { LobbyProvider } from './contexts/LobbyContext'
import './styles/index.css'
import { optimizePerformance } from './utils/performance'

// Inicializar optimizaciones de rendimiento
const performanceMonitor = optimizePerformance();

// Ocultar loading fallback cuando la app esté lista
const hideLoadingFallback = () => {
  const loadingFallback = document.getElementById('loading-fallback');
  if (loadingFallback) {
    loadingFallback.style.display = 'none';
  }
};

// Renderizar la aplicación
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LobbyProvider>
        <App />
      </LobbyProvider>
    </AuthProvider>
  </React.StrictMode>,
)

// Ocultar loading fallback después del render
setTimeout(hideLoadingFallback, 100);

// Cleanup al desmontar
window.addEventListener('beforeunload', () => {
  performanceMonitor.disconnect();
});
