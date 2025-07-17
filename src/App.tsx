import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion } from 'motion/react'
import './App.css'

interface User {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  joinedAt: Date;
}

interface AuthUser {
  id: number;
  username: string;
  email: string;
  token: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  sender?: string;
  timestamp: Date;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Formulario de autenticación
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Conectar al servidor y manejar sesión
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newSocket = io(baseUrl);

    // Verificar si hay sesión guardada al conectar
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    let currentUser = null;

    if (token && user) {
      currentUser = JSON.parse(user);
      setAuthUser(currentUser);
      setShowAuth(false);
    }

    newSocket.on('connect', () => {
      setIsConnected(true);

      // Si el usuario ya está autenticado, unirse al lobby
      if (currentUser) {
        newSocket.emit('join-lobby', { name: currentUser.username });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('users-list', (usersList: User[]) => {
      setUsers(usersList);
    });

    newSocket.on('user-joined', (user: User) => {
      setUsers(prev => [...prev, user]);
    });

    newSocket.on('user-left', (user: { id: string; name: string }) => {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    });

    newSocket.on('user-updated', (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      // Actualizar también el usuario actual si es el mismo
      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
    });

    // Eventos del chat
    newSocket.on('chat-history', (messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    newSocket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Cerrar menú de estado al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showStatusMenu && !target.closest('.user-profile')) {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusMenu]);

  // Unirse al lobby cuando el usuario se autentica y el socket está conectado
  useEffect(() => {
    if (authUser && socket && socket.connected) {
      socket.emit('join-lobby', { name: authUser.username });
    }
  }, [authUser, socket]);

  // Actualizar el usuario actual cuando se recibe la lista de usuarios
  useEffect(() => {
    if (authUser && users.length > 0) {
      const user = users.find(u => u.name === authUser.username);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [users, authUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `${baseUrl}${endpoint}`;

      const body = isLogin
        ? { username: authForm.username, password: authForm.password }
        : authForm;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthUser(data.user);
        setShowAuth(false);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.error('Error de autenticación:', data.error);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  const handleStatusChange = (status: 'online' | 'away') => {
    if (socket) {
      socket.emit('update-status', status);
    }
    setShowStatusMenu(false);
  };

  const toggleStatusMenu = () => {
    setShowStatusMenu(!showStatusMenu);
  };

  const handleLogout = () => {
    // Notificar al servidor que el usuario se desconecta del lobby
    if (socket && currentUser) {
      socket.emit('leave-lobby');
    }

    setAuthUser(null);
    setCurrentUser(null);
    setShowAuth(true);
    setUsers([]);
    setChatMessages([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send-message', { content: newMessage });
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'away': return 'Ausente';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };



  if (showAuth) {
    return (
      <motion.div className="App" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="auth-container" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1>🎮 Lobby de Juegos</h1>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>

          <div className="auth-form-container">
            <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>

            {/* Removed message banner as per edit hint */}

            <form onSubmit={handleAuth} className="auth-form">
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
                className="auth-input"
              />

              {!isLogin && (
                <input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                  className="auth-input"
                />
              )}

              <input
                type="password"
                placeholder="Contraseña"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
                className="auth-input"
              />

              <motion.button
                type="submit"
                className="auth-button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </motion.button>
            </form>

            <div className="auth-switch">
              <p>
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <motion.button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="switch-button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                </motion.button>
              </p>
            </div>
          </div>
        </motion.div>
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

            <div className="chat-messages">             {chatMessages.length === 0 ? (
              <motion.p
                className="no-messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No hay mensajes aún. ¡Sé el primero en escribir!
              </motion.p>
            ) : (
              chatMessages.map(message => (
                <motion.div
                  key={message.id}
                  className={`chat-message ${message.type === 'system' ? 'system-message' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.sender && <span className="message-sender">{message.sender}: </span>}
                  {message.content}
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
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
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
                {authUser?.username.charAt(0).toUpperCase()}
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
    </motion.div >
  );
}

export default App
