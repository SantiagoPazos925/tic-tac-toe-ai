import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const fetchFromBackend = async () => {
    setLoading(true)
    try {
      // Cambia esta URL por tu backend de Railway cuando lo despliegues
      const response = await fetch('http://localhost:3001/api/hello')
      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      setMessage('Error conectando con el backend')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Template Frontend + Backend</h1>
        <p>Frontend: Vercel | Backend: Railway</p>

        <div className="card">
          <button onClick={fetchFromBackend} disabled={loading}>
            {loading ? 'Conectando...' : 'Probar Backend'}
          </button>

          {message && (
            <p className="message">
              {message}
            </p>
          )}
        </div>

        <div className="instructions">
          <h3>📋 Instrucciones:</h3>
          <ol>
            <li>Despliega el backend en Railway usando la carpeta <code>server/</code></li>
            <li>Despliega el frontend en Vercel usando la carpeta raíz</li>
            <li>Actualiza la URL del backend en <code>src/App.tsx</code></li>
            <li>¡Listo para desarrollar! 🎉</li>
          </ol>
        </div>
      </header>
    </div>
  )
}

export default App
