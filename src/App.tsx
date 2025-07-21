import React, { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { ChatSection } from './components/ChatSection';
import { GameList } from './components/GameSlider';
import { LazySocketLoader } from './components/LazySocketLoader';
import { LobbyHeader } from './components/LobbyHeader';
import { MobileNavigation } from './components/MobileNavigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SocketStatusIndicator } from './components/SocketOptimizer';
import { SystemMessages } from './components/SystemMessages';
import { UserContextMenu } from './components/UserContextMenu';

import { ChatDemo } from './components/ChatDemo';
import { UsersList } from './components/UsersList';
import { useAuthContext } from './contexts/AuthContext';
import { useLobbyContext } from './contexts/LobbyContext';
import './styles/index.css';
import Logger from './utils/logger';
import { optimizePerformance } from './utils/performance';

// Componentes de carga diferida para móviles
// const LazyVirtualizationDemo = React.lazy(() => import('./components/VirtualizationDemo').then(module => ({ default: module.VirtualizationDemo })));
// const LazyImageOptimizationDemo = React.lazy(() => import('./components/ImageOptimizationDemo').then(module => ({ default: module.ImageOptimizationDemo })));

const App: React.FC = () => {
  const { isAuthenticated, isLoading, authUser } = useAuthContext();
  const {
    isConnected,
    ping,
    users,
    currentUser,
    messages,
    systemMessages,
    newMessage,
    selectedGameId,
    showUserContextMenu,
    contextMenuUser,
    contextMenuPosition,
    setNewMessage,
    handleSendMessage,
    handleGameSelect,
    handleStatusChange,
    handleUserContextMenu,
    closeUserContextMenu,
    handleUserAction,
    handleLogout,
    chatEndRef,
    systemMessagesEndRef,
    sendPing,
  } = useLobbyContext();

  const [isMobile, setIsMobile] = useState(false);
  const [showChatDemo, setShowChatDemo] = useState(false);

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
      currentUser: currentUser?.username,
      isMobile
    });
    
    // Debug: Verificar usuarios
    if (users.length > 0) {
      Logger.info('Usuarios disponibles:', users.map(u => ({ username: u.username, status: u.status })));
    } else {
      Logger.info('No hay usuarios en la lista');
    }
  }, [isAuthenticated, isConnected, users.length, messages.length, currentUser, isMobile]);

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
            {/* Columna de canales (izquierda) */}
            <aside className="channels-sidebar">
              <div className="channels-header">
                <h3>Canales</h3>
              </div>
              <div className="channels-list">
                <div className="channel-item active">
                  <span className="channel-icon">💬</span>
                  <span className="channel-name">General</span>
                </div>
                <div className="channel-item">
                  <span className="channel-icon">🎮</span>
                  <span className="channel-name">Juegos</span>
                </div>
                <div className="channel-item">
                  <span className="channel-icon">🤖</span>
                  <span className="channel-name">IA</span>
                </div>
                <div className="channel-item">
                  <span className="channel-icon">💻</span>
                  <span className="channel-name">Tecnología</span>
                </div>
              </div>
            </aside>

            {/* Sección central con Game List */}
            <section className="game-section">
              {/* Botón para mostrar demo */}
              <div className="chat-demo-button">
                <button
                  onClick={() => setShowChatDemo(true)}
                  className="demo-trigger-btn"
                  title="Ver nuevas funcionalidades del chat"
                >
                  🆕 Nuevas Funcionalidades
                </button>
              </div>
              
              {/* Game List en la parte superior */}
              <GameList
                onGameSelect={handleGameSelect}
                selectedGameId={selectedGameId}
              />
            </section>

            {/* Sidebar derecho con dos columnas */}
            <aside className="users-sidebar">
              {/* Columna 2: Mensajes del sistema y Chat */}
              <div className="system-column">
                <SystemMessages
                  messages={systemMessages}
                  systemMessagesEndRef={systemMessagesEndRef}
                />
                
                <ChatSection
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  chatEndRef={chatEndRef}
                  currentUser={authUser?.username || ''}
                />
              </div>
              {/* Columna 1: Lista de usuarios */}
              <div className="users-column">
                <UsersList
                  users={users}
                  onUserContextMenu={handleUserContextMenu}
                  onStatusChange={handleStatusChange}
                  onLogout={handleLogout}
                  currentUser={currentUser}
                />
              </div>
              
              
            </aside>
          </div>

          {/* Demos de optimización (OCULTOS) */}
          {/* 
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
          */}

          {/* Indicador offline */}
          <OfflineIndicator />

          {/* Preloaders de recursos (OCULTOS) */}
          {/* 
          <ResourcePreloader />
          <CriticalResourcePreloader />
          */}
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

        {/* Demo de nuevas funcionalidades del chat */}
        {showChatDemo && (
          <ChatDemo onClose={() => setShowChatDemo(false)} />
        )}

      </div>
    </LazySocketLoader>
  );
};

export default App;
