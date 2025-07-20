import React, { Suspense, useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { ChatSection } from './components/ChatSection';
import { CriticalResourcePreloader } from './components/CriticalResourcePreloader';
import { LazySocketLoader } from './components/LazySocketLoader';
import { LobbyHeader } from './components/LobbyHeader';
import { MobileNavigation } from './components/MobileNavigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ResourcePreloader } from './components/ResourcePreloader';
import { SocketStatusIndicator } from './components/SocketOptimizer';
import { SystemMessages } from './components/SystemMessages';
import { UserContextMenu } from './components/UserContextMenu';
import { UsersList } from './components/UsersList';
import { useAuthContext } from './contexts/AuthContext';
import { useLobbyContext } from './contexts/LobbyContext';
import './styles/index.css';
import Logger from './utils/logger';
import { optimizePerformance } from './utils/performance';

// Componentes de carga diferida para móviles
const LazyVirtualizationDemo = React.lazy(() => import('./components/VirtualizationDemo').then(module => ({ default: module.VirtualizationDemo })));
const LazyImageOptimizationDemo = React.lazy(() => import('./components/ImageOptimizationDemo').then(module => ({ default: module.ImageOptimizationDemo })));

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const {
    isConnected,
    ping,
    users,
    messages,
    systemMessages,
    newMessage,
    showUserContextMenu,
    contextMenuUser,
    contextMenuPosition,
    setNewMessage,
    sendMessage,
    handleUserContextMenu,
    closeUserContextMenu,
    handleUserAction,
    chatEndRef,
    systemMessagesEndRef,
    sendPing
  } = useLobbyContext();

  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Optimizaciones de rendimiento
  useEffect(() => {
    const performanceMonitor = optimizePerformance();
    
    // Cleanup al desmontar
    return () => {
      performanceMonitor.disconnect();
    };
  }, []);

  // Scroll automático para mensajes del chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, chatEndRef]);

  // Scroll automático para mensajes del sistema
  useEffect(() => {
    if (systemMessagesEndRef.current && systemMessages.length > 0) {
      setTimeout(() => {
        systemMessagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [systemMessages.length, systemMessagesEndRef]);

  // Enviar ping periódicamente
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        sendPing();
      }, 30000); // Ping cada 30 segundos

      return () => clearInterval(pingInterval);
    }
    return undefined;
  }, [isConnected, sendPing]);

  // Logging para debugging
  useEffect(() => {
    Logger.info('App renderizado', {
      isAuthenticated,
      isConnected,
      usersCount: users.length,
      messagesCount: messages.length,
      isMobile
    });
  }, [isAuthenticated, isConnected, users.length, messages.length, isMobile]);

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LazySocketLoader showStatus={false}>
        <div className="auth-container">
          <AuthForm />
        </div>
      </LazySocketLoader>
    );
  }

  return (
    <LazySocketLoader showStatus={isMobile}>
      <div className="app-container">
        {/* Indicador de conexión para móviles */}
        {isMobile && (
          <div className="mobile-connection-indicator">
            <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span className="connection-text">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
            {ping && (
              <span className="ping-text">
                {ping}ms
              </span>
            )}
          </div>
        )}

        {/* Header del lobby */}
        <LobbyHeader 
          isConnected={isConnected}
          ping={ping}
        />

        {/* Navegación móvil */}
        {isMobile && (
          <MobileNavigation 
            onToggleUsers={() => {}}
            onToggleChannels={() => {}}
            showUsers={false}
            showChannels={false}
          />
        )}

        {/* Contenido principal */}
        <main className="main-content">
          <div className="lobby-container">
            {/* Lista de usuarios */}
            <aside className="users-sidebar">
              <UsersList
                users={users}
                onUserContextMenu={handleUserContextMenu}
              />
            </aside>

            {/* Sección de chat */}
            <section className="chat-section">
              <ChatSection
                messages={messages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={sendMessage}
                chatEndRef={chatEndRef}
              />
            </section>
          </div>

          {/* Mensajes del sistema */}
          <SystemMessages
            messages={systemMessages}
            systemMessagesEndRef={systemMessagesEndRef}
          />

          {/* Demos de optimización (solo en desktop) */}
          {!isMobile && (
            <>
              <Suspense fallback={<div>Cargando demo de virtualización...</div>}>
                <LazyVirtualizationDemo onUserContextMenu={handleUserContextMenu} />
              </Suspense>

              <Suspense fallback={<div>Cargando demo de optimización de imágenes...</div>}>
                <LazyImageOptimizationDemo />
              </Suspense>
            </>
          )}

          {/* Indicador offline */}
          <OfflineIndicator />

          {/* Preloaders de recursos */}
          <ResourcePreloader />
          <CriticalResourcePreloader />
        </main>

        {/* Menú contextual de usuario */}
        {showUserContextMenu && contextMenuUser && contextMenuPosition && (
          <UserContextMenu
            contextMenuUser={contextMenuUser}
            contextMenuPosition={contextMenuPosition}
            onUserAction={handleUserAction}
            onClose={closeUserContextMenu}
          />
        )}

        {/* Indicador de estado de Socket (solo en desarrollo) */}
        {import.meta.env.DEV && (
          <SocketStatusIndicator />
        )}
      </div>
    </LazySocketLoader>
  );
};

export default App;
