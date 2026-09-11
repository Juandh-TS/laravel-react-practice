import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getToken, setToken as persistToken } from '@/api/client'
import { authApi } from '../api/authApi'
import type { LoginInput, RegisterInput, User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    persistToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(clearSession)
      .finally(() => setLoading(false))
  }, [clearSession])

  useEffect(() => {
    window.addEventListener('auth:unauthorized', clearSession)
    return () => window.removeEventListener('auth:unauthorized', clearSession)
  }, [clearSession])

  async function login(data: LoginInput) {
    const response = await authApi.login(data)
    persistToken(response.token)
    setUser(response.user)
  }

  async function register(data: RegisterInput) {
    const response = await authApi.register(data)
    persistToken(response.token)
    setUser(response.user)
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return ctx
}
