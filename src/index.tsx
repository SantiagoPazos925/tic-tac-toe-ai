
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { LobbyProvider } from './contexts/LobbyContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LobbyProvider>
        <App />
      </LobbyProvider>
    </AuthProvider>
  </React.StrictMode>,
)
