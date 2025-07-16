import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
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

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  // Formulario de autenticación
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Conectar al servidor
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');

    newSocket.on('connect', () => {
      setIsConnected(true);
      setMessage('Conectado al servidor');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setMessage('Desconectado del servidor');
    });

    newSocket.on('users-list', (usersList: User[]) => {
      setUsers(usersList);
    });

    newSocket.on('user-joined', (user: User) => {
      setUsers(prev => [...prev, user]);
      setMessage(`${user.name} se unió al lobby`);
    });

    newSocket.on('user-left', (user: { id: string; name: string }) => {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setMessage(`${user.name} se desconectó`);
    });

    newSocket.on('user-updated', (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { username: authForm.username, password: authForm.password }
        : authForm;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`, {
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
        setMessage(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Error de conexión');
      console.error('Error:', error);
    }
  };

  const handleStatusChange = (status: 'online' | 'away') => {
    if (socket) {
      socket.emit('update-status', status);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setShowAuth(true);
    setUsers([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMessage('Sesión cerrada');
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

  // Verificar si hay sesión guardada
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setAuthUser(JSON.parse(user));
      setShowAuth(false);
    }
  }, []);

  if (showAuth) {
    return (
      <div className="App">
        <div className="auth-container">
          <h1>🎮 Lobby de Juegos</h1>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>

          <div className="auth-form-container">
            <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>

            {message && (
              <div className={`message-banner ${message.includes('Error') ? 'error' : ''}`}>
                {message}
              </div>
            )}

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

              <button type="submit" className="auth-button">
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            </form>

            <div className="auth-switch">
              <p>
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="switch-button"
                >
                  {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="lobby-container">
        <header className="lobby-header">
          <h1>🎮 Lobby de Juegos</h1>
          <div className="user-info">
            <div className="connection-status">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </div>
            {authUser && (
              <div className="current-user">
                <span>Bienvenido, {authUser.username}</span>
                <button onClick={handleLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {message && (
          <div className="message-banner">
            {message}
          </div>
        )}

        <div className="lobby-content">
          <div className="users-section">
            <h2>👥 Usuarios en Línea ({users.length})</h2>
            <div className="users-list">
              {users.length === 0 ? (
                <p className="no-users">No hay usuarios en línea</p>
              ) : (
                users.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <h3>{user.name}</h3>
                        <span
                          className="user-status"
                          style={{ color: getStatusColor(user.status) }}
                        >
                          {getStatusText(user.status)}
                        </span>
                      </div>
                    </div>
                    <div className="user-time">
                      Desde {formatTime(user.joinedAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="controls-section">
            <h3>Controles</h3>
            <div className="status-controls">
              <button
                onClick={() => handleStatusChange('online')}
                className="status-button online"
              >
                En Línea
              </button>
              <button
                onClick={() => handleStatusChange('away')}
                className="status-button away"
              >
                Ausente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
