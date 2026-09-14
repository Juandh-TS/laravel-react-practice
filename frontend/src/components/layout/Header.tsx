import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuth } from '@/features/auth/context/AuthContext'

interface HeaderProps {
  brand?: string
}

export function Header({ brand = 'Bienvenido/a:' }: HeaderProps) {
  const { user, logout } = useAuth()
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleConfirmLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
      setConfirmingLogout(false)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="header-bar">
      <p className="brand">
        {brand}
        {user && <span className="header-user">{user.name}</span>}
      </p>
      <div className="header-actions">
        <ThemeToggle />
        {user && (
          <button type="button" className="theme-toggle" onClick={() => setConfirmingLogout(true)}>
            Cerrar sesión
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        title="Cerrar sesión"
        description="¿Seguro que quieres cerrar sesión?"
        confirmLabel="Cerrar sesión"
        isConfirming={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  )
}
