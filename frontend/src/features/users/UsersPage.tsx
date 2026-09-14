import { useEffect, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Spinner } from '@/components/common/Spinner'
import { companiesApi } from '@/features/companies/api/companiesApi'
import type { Company } from '@/features/companies/types'
import { usersApi } from './api/usersApi'
import { UserForm } from './components/UserForm'
import { UserItem } from './components/UserItem'
import type { User, UserInput } from './types'

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setError('No se pudo conectar con la API. Asegurate que el backend esté corriendo.'))
      .finally(() => setLoading(false))

    companiesApi.list().then(setCompanies).catch(() => {})
  }, [])

  async function handleCreate(data: UserInput) {
    setFormError(null)
    try {
      const user = await usersApi.create(data)
      setUsers((current) => [user, ...current])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el usuario.'
      setFormError(message)
      throw err
    }
  }

  async function handleUpdate(id: number, data: Partial<UserInput>) {
    setFormError(null)
    try {
      const updated = await usersApi.update(id, data)
      setUsers((current) =>
        current.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el usuario.'
      setFormError(message)
      throw err
    }
  }

  async function handleDelete(id: number) {
    setFormError(null)
    try {
      await usersApi.remove(id)
      setUsers((current) => current.filter((u) => u.id !== id))
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo borrar el usuario.')
    }
  }

  async function handleToggleActive(id: number) {
    setFormError(null)
    try {
      const updated = await usersApi.toggleActive(id)
      setUsers((current) =>
        current.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      )
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo cambiar el estado del usuario.')
    }
  }

  return (
    <>
      <h1>
        Usuarios
        {!loading && !error && <Badge count={users.length} />}
      </h1>
      <p className="subtitle">Gestión de usuarios y empresas asociadas</p>

      <UserForm companies={companies} onSubmit={handleCreate} />

      <ErrorAlert message={formError} />
      <ErrorAlert message={error} />

      {loading && <Spinner message="Cargando usuarios..." />}

      {!loading && !error && users.length === 0 && (
        <p className="state-message">No hay usuarios registrados aún.</p>
      )}

      <ul className="user-list">
        {users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            companies={companies}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        ))}
      </ul>
    </>
  )
}
