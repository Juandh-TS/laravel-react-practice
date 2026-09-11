import { useState, type FormEvent } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useAuth } from '../context/AuthContext'

interface RegisterFormProps {
  onSwitch: () => void
}

const initialForm = { name: '', email: '', password: '', password_confirmation: '' }

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)
    try {
      await register(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        disabled={isSubmitting}
        autoComplete="name"
      />
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
        minLength={8}
        disabled={isSubmitting}
        autoComplete="new-password"
      />
      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={form.password_confirmation}
        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
        required
        minLength={8}
        disabled={isSubmitting}
        autoComplete="new-password"
      />
      <ErrorAlert message={error} />
      <button type="submit" className="btn primary" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
      <p className="auth-switch">
        ¿Ya tienes cuenta?{' '}
        <button type="button" className="link-btn" onClick={onSwitch} disabled={isSubmitting}>
          Inicia sesión
        </button>
      </p>
    </form>
  )
}
