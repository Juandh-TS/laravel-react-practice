import { useState, type FormEvent } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useAuth } from '../context/AuthContext'

interface LoginFormProps {
  onSwitch: () => void
}

const initialForm = { email: '', password: '' }

export function LoginForm({ onSwitch }: LoginFormProps) {
  const { login } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)
    try {
      await login(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        disabled={isSubmitting}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        disabled={isSubmitting}
        autoComplete="current-password"
      />
      <ErrorAlert message={error} />
      <button type="submit" className="btn primary" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
      </button>
      <p className="auth-switch">
        ¿No tienes cuenta?{' '}
        <button type="button" className="link-btn" onClick={onSwitch} disabled={isSubmitting}>
          Regístrate
        </button>
      </p>
    </form>
  )
}
