import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'

import { AuthProvider } from './contexts/auth-context.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)
