import { useState } from 'react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="auth-page">
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>
      <div className="panel auth-panel">
        <h1>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        {mode === 'login' ? (
          <LoginForm onSwitch={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitch={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
