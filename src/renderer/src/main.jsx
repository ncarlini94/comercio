import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { iniciarTema } from './tema'

// Se aplica antes de renderizar para evitar un destello del tema claro.
iniciarTema()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
