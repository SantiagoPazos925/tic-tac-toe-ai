import { motion } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { AuthForm } from './components/AuthForm'
import { ChatSection } from './components/ChatSection'
import { CriticalResourcePreloader } from './components/CriticalResourcePreloader'
import { LobbyHeader } from './components/LobbyHeader'
import { MobileNavigation } from './components/MobileNavigation'
import { OfflineIndicator } from './components/OfflineIndicator'
import { SystemMessages } from './components/SystemMessages'
import { UserProfile } from './components/UserProfile'
import { UsersList } from './components/UsersList'
import { VirtualizationDemo } from './components/VirtualizationDemo'
import { useAuthContext } from './contexts/AuthContext'
import { useLobbyContext } from './contexts/LobbyContext'

// Lazy load components that are not critical for initial render
const UserContextMenu = lazy(() => import('./components/UserContextMenu').then(module => ({ default: module.UserContextMenu })));

// Loading component for lazy loaded components
const LazyLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-discord-accent"></div>
  </div>
);

// Hook para detectar el tamaño de pantalla
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

function App() {
  const { authUser, isAuthenticated } = useAuthContext();
  const isMobile = useIsMobile();

  // Estado para navegación móvil (solo en móviles)
  const [showUsers, setShowUsers] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [showVirtualizationDemo, setShowVirtualizationDemo] = useState(false);
  
  const {
    isConnected,
    ping,
    users,
    messages: userMessages,
    systemMessages,
    newMessage,
    currentUser,
    showStatusMenu,
    showUserContextMenu,
    contextMenuUser,
    contextMenuPosition,
    setNewMessage,
    sendMessage,
    toggleStatusMenu,
    handleStatusChange,
    handleUserContextMenu,
    closeUserContextMenu,
    handleUserAction,
    handleLogout,
    chatEndRef,
    systemMessagesEndRef,
    socketService,
    sendPing
  } = useLobbyContext();

  // Unirse al lobby cuando el usuario se autentica y el socket está conectado
  useEffect(() => {
    if (authUser && isConnected) {
      // Solo unirse al lobby si no se ha unido ya (evitar doble conexión)
      const currentSocket = socketService.getSocket();
      if (currentSocket && currentSocket.connected) {
        // Verificar si ya está en el lobby
        const isAlreadyInLobby = users.some(user => user.username === authUser.username);
        if (!isAlreadyInLobby) {
          socketService.joinLobby(authUser.username);
        }
      }
    }
  }, [authUser, isConnected, socketService, users]);

  // Enviar pings periódicos para medir latencia
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendPing();
    }, 5000); // Ping cada 5 segundos

    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, sendPing]);

  // Funciones para navegación móvil (solo en móviles)
  const toggleUsers = () => {
    if (isMobile) {
      setShowUsers(!showUsers);
      setShowChannels(false); // Cerrar canales si están abiertos
    }
  };

  const toggleChannels = () => {
    if (isMobile) {
      setShowChannels(!showChannels);
      setShowUsers(false); // Cerrar usuarios si están abiertos
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div className="App" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AuthForm />
      </motion.div>
    );
  }

  return (
    <motion.div className="App" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Preload de recursos críticos */}
      <CriticalResourcePreloader />
      
      {/* Indicadores de estado offline y actualizaciones */}
      <OfflineIndicator />

      <LobbyHeader
        isConnected={isConnected}
        ping={ping}
      />

      {/* Botón para mostrar/ocultar demo de virtualización */}
      <div className="demo-toggle-container">
        <button
          className="demo-toggle-button"
          onClick={() => setShowVirtualizationDemo(!showVirtualizationDemo)}
        >
          {showVirtualizationDemo ? '🔽 Ocultar Demo Virtualización' : '🚀 Mostrar Demo Virtualización'}
        </button>
      </div>

      {/* Demo de Virtualización */}
      {showVirtualizationDemo && (
        <VirtualizationDemo onUserContextMenu={handleUserContextMenu} />
      )}

      <div className="lobby-container">
        {/* Left Sidebar - Canales */}
        <div className={`left-sidebar ${isMobile && showChannels ? 'show-mobile' : ''}`}>
          <span>Canales próximamente...</span>
        </div>

        {/* Main Content - Chat */}
        <div className="main-content">
          <SystemMessages
            messages={systemMessages}
            systemMessagesEndRef={systemMessagesEndRef}
          />

          <ChatSection
            messages={userMessages}
            chatEndRef={chatEndRef}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={sendMessage}
          />
        </div>

        {/* Right Sidebar - Users List + Profile */}
        <div className={`right-sidebar ${isMobile && showUsers ? 'show-mobile' : ''}`}>
          <UsersList
            users={users}
            onUserContextMenu={handleUserContextMenu}
          />

          <UserProfile
            authUser={authUser}
            currentUser={currentUser}
            showStatusMenu={showStatusMenu}
            toggleStatusMenu={toggleStatusMenu}
            onStatusChange={handleStatusChange}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Navegación móvil - solo se renderiza en móviles */}
      {isMobile && (
        <>
          <MobileNavigation
            onToggleUsers={toggleUsers}
            onToggleChannels={toggleChannels}
            showUsers={showUsers}
            showChannels={showChannels}
          />

          {/* Overlay para cerrar sidebars en móvil */}
          {(showUsers || showChannels) && (
            <div
              className="sidebar-overlay show"
              onClick={() => {
                setShowUsers(false);
                setShowChannels(false);
              }}
            />
          )}
        </>
      )}

      {/* User Context Menu */}
      {showUserContextMenu && contextMenuUser && (
        <Suspense fallback={<LazyLoader />}>
          <UserContextMenu
            contextMenuUser={contextMenuUser}
            contextMenuPosition={contextMenuPosition}
            onUserAction={handleUserAction}
            onClose={closeUserContextMenu}
          />
        </Suspense>
      )}
    </motion.div>
  );
}

export default App
