import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import CollectionProvider from './context/CollectionContext'
import App from './App.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CollectionProvider>
          <App />
        </CollectionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
