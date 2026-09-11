import { useEffect, useState, type FormEvent } from 'react'
import { companiesApi, usersApi, type UserInput } from './api'
import type { Company, User } from './types'

interface EditForm {
  name: string
  email: string
  password: string
  companyId: string
}

const emptyEditForm: EditForm = { name: '', email: '', password: '', companyId: '' }

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<EditForm>(emptyEditForm)
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setError('No se pudo conectar con la API. ¿Corriste "php artisan serve" en backend/?'))
      .finally(() => setLoading(false))

    companiesApi.list().then(setCompanies).catch(() => {})
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    try {
      const user = await usersApi.create({
        name: form.name,
        email: form.email,
        password: form.password,
        company_id: form.companyId ? Number(form.companyId) : null,
      })
      setUsers((current) => [user, ...current])
      setForm(emptyEditForm)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    }
  }

  function startEdit(user: User) {
    setEditingId(user.id)
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      companyId: user.company_id ? String(user.company_id) : '',
    })
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyEditForm)
    setEditError(null)
  }

  async function handleUpdate(event: FormEvent, id: number) {
    event.preventDefault()
    setEditError(null)

    const data: Partial<UserInput> = {
      name: editForm.name,
      email: editForm.email,
      company_id: editForm.companyId ? Number(editForm.companyId) : null,
    }
    if (editForm.password) data.password = editForm.password

    try {
      const updated = await usersApi.update(id, data)
      setUsers((current) => current.map((u) => (u.id === id ? updated : u)))
      cancelEdit()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await usersApi.remove(id)
      setUsers((current) => current.filter((u) => u.id !== id))
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo borrar el usuario.')
    }
  }

  return (
    <>
      <h1>
        Usuarios
        {!loading && !error && <span className="count-badge">{users.length}</span>}
      </h1>
      <p className="subtitle">CRUD de prueba sobre el modelo User</p>

      <form className="user-form" onSubmit={handleCreate}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          maxLength={255}
          required
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          maxLength={255}
          required
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Contraseña"
          minLength={8}
          maxLength={72}
          required
        />
        <select
          value={form.companyId}
          onChange={(e) => setForm({ ...form, companyId: e.target.value })}
        >
          <option value="">Sin empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn">
          Agregar
        </button>
      </form>

      {formError && <p className="error">⚠ {formError}</p>}
      {error && <p className="error">⚠ {error}</p>}

      <ul className="user-list">
        {users.map((user) =>
          editingId === user.id ? (
            <li key={user.id}>
              <form className="user-edit-form" onSubmit={(e) => handleUpdate(e, user.id)}>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nombre"
                  maxLength={255}
                  required
                />
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Email"
                  maxLength={255}
                  required
                />
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Nueva contraseña (opcional)"
                  minLength={8}
                  maxLength={72}
                />
                <select
                  value={editForm.companyId}
                  onChange={(e) => setEditForm({ ...editForm, companyId: e.target.value })}
                >
                  <option value="">Sin empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <div className="user-edit-actions">
                  <button type="submit" className="btn">
                    Guardar
                  </button>
                  <button type="button" className="btn secondary" onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
                {editError && <p className="error">⚠ {editError}</p>}
              </form>
            </li>
          ) : (
            <li key={user.id}>
              <div className="user-info">
                <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <div className="user-details">
                  <strong>{user.name}</strong>
                  <span className="user-email">{user.email}</span>
                  <span className="company-tag">{user.company ? user.company.name : 'Sin empresa'}</span>
                </div>
              </div>
              <div className="user-actions">
                <button type="button" className="icon-btn" onClick={() => startEdit(user)}>
                  Editar
                </button>
                <button type="button" className="icon-btn danger" onClick={() => handleDelete(user.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {loading && <p className="state-message">Cargando...</p>}
      {!loading && !error && users.length === 0 && (
        <p className="state-message">No hay usuarios todavía. Agregá el primero arriba.</p>
      )}
    </>
  )
}

export default Users
