import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useAuthContext } from './contexts/AuthContext'
import { useSocket } from './hooks/useSocket'
import { AuthForm } from './components/AuthForm'
import { User, ContextMenuPosition } from './types'
// import { ChatMessage, UserAction, AuthUser } from './types' // Para uso futuro
import { formatTime, getStatusColor, getStatusText, getAvatarInitial } from './utils/formatters'
import './styles/App.css'

function App() {
  const { authUser, isAuthenticated, logout } = useAuthContext();
  const { isConnected, ping, users, chatMessages, socketService, sendPing } = useSocket();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showUserContextMenu, setShowUserContextMenu] = useState(false);
  const [contextMenuUser, setContextMenuUser] = useState<User | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const systemMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Unirse al lobby cuando el usuario se autentica y el socket está conectado
  useEffect(() => {
    if (authUser && isConnected) {
      socketService.joinLobby(authUser.username);
    }
  }, [authUser, isConnected, socketService]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.filter(message => message.type === 'user').length]);

  // Scroll automático para mensajes del sistema
  useEffect(() => {
    const systemMessages = chatMessages.filter(message => message.type === 'system');
    if (systemMessagesEndRef.current && systemMessages.length > 0) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        systemMessagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [chatMessages.filter(message => message.type === 'system').length]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showStatusMenu && !target.closest('.user-profile')) {
        setShowStatusMenu(false);
      }
      if (showUserContextMenu && !target.closest('.user-context-menu')) {
        closeUserContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusMenu, showUserContextMenu]);

  // Unirse al lobby cuando el usuario se autentica y el socket está conectado
  useEffect(() => {
    if (authUser && isConnected) {
      socketService.joinLobby(authUser.username);
    }
  }, [authUser, isConnected, socketService]);

  // Actualizar el usuario actual cuando se recibe la lista de usuarios
  useEffect(() => {
    if (authUser && users.length > 0) {
      const user = users.find(u => u.name === authUser.username);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [users, authUser]);

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

  const handleStatusChange = (status: 'online' | 'away') => {
    socketService.updateStatus(status);
    setShowStatusMenu(false);
  };

  const toggleStatusMenu = () => {
    setShowStatusMenu(!showStatusMenu);
  };

  const handleUserContextMenu = (e: React.MouseEvent, user: User) => {
    e.preventDefault(); // Prevenir el menú contextual del navegador

    const menuWidth = 250; // Ancho aproximado del menú
    const menuHeight = 300; // Alto aproximado del menú
    const padding = 10; // Padding desde el borde

    let x = e.clientX;
    let y = e.clientY;

    // Obtener la posición del contenedor users-list
    const usersListElement = document.querySelector('.users-list') as HTMLElement;
    const usersListRect = usersListElement?.getBoundingClientRect();
    const minLeftPosition = usersListRect ? usersListRect.left : padding;

    // Ajustar posición horizontal si está muy cerca del borde derecho
    if (x + menuWidth > window.innerWidth - padding) {
      x = e.clientX - menuWidth;
    }

    // Ajustar posición vertical si está muy cerca del borde inferior
    if (y + menuHeight > window.innerHeight - padding) {
      y = e.clientY - menuHeight;
    }

    // Asegurar que el borde izquierdo del menú coincida como mínimo con el borde izquierdo de users-list
    if (x < minLeftPosition) {
      x = minLeftPosition;
    }

    // Asegurar que no se salga por arriba
    if (y < padding) {
      y = padding;
    }

    setContextMenuUser(user);
    setContextMenuPosition({ x, y });
    setShowUserContextMenu(true);
  };

  const closeUserContextMenu = () => {
    setShowUserContextMenu(false);
    setContextMenuUser(null);
  };

  const handleUserAction = (action: string) => {
    if (!contextMenuUser) return;

    switch (action) {
      case 'profile':
        // Aquí se podría abrir un perfil del usuario
        console.log(`Ver perfil de ${contextMenuUser.name}`);
        break;
      case 'message':
        // Aquí se podría abrir un chat privado
        console.log(`Enviar mensaje a ${contextMenuUser.name}`);
        break;
      case 'invite':
        // Aquí se podría invitar a jugar
        console.log(`Invitar a ${contextMenuUser.name} a jugar`);
        break;
      case 'block':
        // Aquí se podría bloquear al usuario
        console.log(`Bloquear a ${contextMenuUser.name}`);
        break;
    }

    closeUserContextMenu();
  };

  const handleLogout = () => {
    // Notificar al servidor que el usuario se desconecta del lobby
    if (currentUser) {
      socketService.leaveLobby();
    }
    logout();
    setCurrentUser(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.sendMessage(newMessage);
      setNewMessage('');
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
      <header className="lobby-header">
        <h1>🎮 Lobby de Juegos</h1>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Conectado' : 'Desconectado'}
          {isConnected && ping !== null && (
            <span className="ping-indicator">
              • {ping}ms
            </span>
          )}
        </div>
      </header>

      <div className="lobby-container">
        {/* Left Sidebar - Empty for now */}
        <div className="left-sidebar">
          <span>Canales próximamente...</span>
        </div>

        {/* Main Content - Chat */}
        <div className="main-content">
          <div className="chat-section">
            <div className="chat-header">
              <h2>💬 Chat del Lobby</h2>
            </div>

            {/* Sección de mensajes del sistema */}
            <div className="system-messages-section">
              {chatMessages.filter(message => message.type === 'system').length > 0 && (
                <div className="system-messages">
                  <h4 className="system-messages-title">📢 Información del Sistema</h4>
                  {chatMessages
                    .filter(message => message.type === 'system')
                    .map(message => (
                      <motion.div
                        key={message.id}
                        className="system-message"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="system-icon">ℹ️</span>
                        <span className="system-content">{message.content}</span>
                        <span className="system-timestamp">{formatTime(message.timestamp)}</span>
                      </motion.div>
                    ))}
                  <div ref={systemMessagesEndRef} />
                </div>
              )}
            </div>

            {/* Sección de mensajes del chat */}
            <div className="chat-messages">
              {chatMessages.filter(message => message.type === 'user').length === 0 ? (
                <motion.p
                  className="no-messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  No hay mensajes aún. ¡Sé el primero en escribir!
                </motion.p>
              ) : (
                chatMessages
                  .filter(message => message.type === 'user')
                  .map(message => (
                    <motion.div
                      key={message.id}
                      className="chat-message"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="message-sender">{message.sender}: </span>
                      <span className="message-content">{message.content}</span>
                      <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                    </motion.div>
                  ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
                className="chat-input"
              />
              <motion.button
                type="submit"
                className="send-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enviar
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Users List + Profile */}
        <div className="right-sidebar">
          <div className="users-section">
            <h3>👥 USUARIOS EN LÍNEA ({users.length})</h3>
            <div className="users-list">            {users.length === 0 ? (
              <motion.p
                className="no-users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No hay usuarios en línea
              </motion.p>
            ) : (
              users.map(user => (
                <motion.div
                  key={user.id}
                  className="user-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  onContextMenu={(e) => handleUserContextMenu(e, user)}
                >
                  <div className="user-avatar">
                    {getAvatarInitial(user.name)}
                  </div>
                  <div className="user-details">
                    <h4>{user.name}</h4>
                    <span
                      className="user-status"
                      style={{ color: getStatusColor(user.status) }}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </div>
                  <div className="user-time">
                    Desde {formatTime(user.joinedAt)}
                  </div>
                </motion.div>
              ))
            )}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="user-profile-section">
            <div className="user-profile">              <div className="profile-header" onClick={toggleStatusMenu}>
              <div className="profile-avatar">
                {authUser ? getAvatarInitial(authUser.username) : ''}
              </div>
              <div className="profile-info">
                <h3>{authUser?.username}</h3>
                <span
                  className="current-status"
                  style={{ color: currentUser ? getStatusColor(currentUser.status) : '#10b981' }}
                >
                  {currentUser ? getStatusText(currentUser.status) : 'En línea'}
                </span>
              </div>
              <motion.button
                className="status-toggle-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚙️
              </motion.button>
            </div>

              {showStatusMenu && (
                <motion.div
                  className="status-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="status-options">
                    <motion.button
                      onClick={() => handleStatusChange('online')}
                      className="status-option online"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="status-dot online"></span>
                      <span>En línea</span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleStatusChange('away')}
                      className="status-option away"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="status-dot away"></span>
                      <span>Ausente</span>
                    </motion.button>
                    <motion.button
                      onClick={handleLogout}
                      className="status-option logout-option"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>🚪</span>
                      <span>Cerrar Sesión</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Context Menu */}
      {showUserContextMenu && contextMenuUser && (
        <motion.div
          className="user-context-menu"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onAnimationComplete={() => {
            // Ajustar posición después de que el menú se renderice
            const menuElement = document.querySelector('.user-context-menu') as HTMLElement;
            if (menuElement) {
              const rect = menuElement.getBoundingClientRect();
              const padding = 10;
              let newX = contextMenuPosition.x;
              let newY = contextMenuPosition.y;

              // Ajustar si se sale por la derecha
              if (rect.right > window.innerWidth - padding) {
                newX = window.innerWidth - rect.width - padding;
              }

              // Ajustar si se sale por abajo
              if (rect.bottom > window.innerHeight - padding) {
                newY = window.innerHeight - rect.height - padding;
              }

              // Ajustar si se sale por la izquierda
              if (rect.left < padding) {
                newX = padding;
              }

              // Ajustar si se sale por arriba
              if (rect.top < padding) {
                newY = padding;
              }

              if (newX !== contextMenuPosition.x || newY !== contextMenuPosition.y) {
                setContextMenuPosition({ x: newX, y: newY });
              }
            }
          }}
        >
          <div className="context-menu-header">
            <div className="context-user-avatar">
              {getAvatarInitial(contextMenuUser.name)}
            </div>
            <div className="context-user-info">
              <h4>{contextMenuUser.name}</h4>
              <span
                className="context-user-status"
                style={{ color: getStatusColor(contextMenuUser.status) }}
              >
                {getStatusText(contextMenuUser.status)}
              </span>
            </div>
          </div>
          <div className="context-menu-options">
            <motion.button
              onClick={() => handleUserAction('profile')}
              className="context-option"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>👤</span>
              <span>Ver Perfil</span>
            </motion.button>
            <motion.button
              onClick={() => handleUserAction('message')}
              className="context-option"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>💬</span>
              <span>Enviar Mensaje</span>
            </motion.button>
            <motion.button
              onClick={() => handleUserAction('invite')}
              className="context-option"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>🎮</span>
              <span>Invitar a Jugar</span>
            </motion.button>
            <motion.button
              onClick={() => handleUserAction('block')}
              className="context-option danger"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>🚫</span>
              <span>Bloquear Usuario</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div >
  );
}

export default App
