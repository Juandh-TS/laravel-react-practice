import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuth } from '@/features/auth/context/AuthContext'

interface HeaderProps {
  brand?: string
}

export function Header({ brand = 'Laravel + React Practice' }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <div className="header-bar">
      <p className="brand">{brand}</p>
      <div className="header-actions">
        {user && <span className="header-user">{user.name}</span>}
        <ThemeToggle />
        {user && (
          <button type="button" className="theme-toggle" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  )
}
