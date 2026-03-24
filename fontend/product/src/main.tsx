import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './component/hook/hook'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)