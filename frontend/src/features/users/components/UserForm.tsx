import { useState, type FormEvent } from 'react'
import type { Company } from '@/features/companies/types'
import type { UserInput } from '../types'

interface UserFormProps {
  companies: Company[]
  onSubmit: (data: UserInput) => Promise<void>
}

const initialForm = { name: '', email: '', password: '', companyId: '' }

export function UserForm({ companies, onSubmit }: UserFormProps) {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        company_id: form.companyId ? Number(form.companyId) : null,
      })
      setForm(initialForm)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        disabled={isSubmitting}
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        disabled={isSubmitting}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={8}
        disabled={isSubmitting}
      />
      <select
        value={form.companyId}
        onChange={(e) => setForm({ ...form, companyId: e.target.value })}
        disabled={isSubmitting}
      >
        <option value="">Sin empresa</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
      <button type="submit" className="btn primary" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  )
}
