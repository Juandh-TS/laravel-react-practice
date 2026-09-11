import { useEffect, useState, type FormEvent } from 'react'
import { usersApi } from './api'
import type { User } from './types'

interface EditForm {
  name: string
  email: string
  password: string
}

const emptyEditForm: EditForm = { name: '', email: '', password: '' }

function Users() {
  const [users, setUsers] = useState<User[]>([])
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
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    try {
      const user = await usersApi.create(form)
      setUsers((current) => [user, ...current])
      setForm(emptyEditForm)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    }
  }

  function startEdit(user: User) {
    setEditingId(user.id)
    setEditForm({ name: user.name, email: user.email, password: '' })
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

    const data: Partial<EditForm> = { name: editForm.name, email: editForm.email }
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
    await usersApi.remove(id)
    setUsers((current) => current.filter((u) => u.id !== id))
  }

  return (
    <>
      <h1>Usuarios</h1>
      <p className="subtitle">CRUD de prueba sobre el modelo User</p>

      <form className="user-form" onSubmit={handleCreate}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          required
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Contraseña"
          required
        />
        <button type="submit">Agregar</button>
      </form>

      {formError && <p className="error">{formError}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Cargando...</p>}

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
                  required
                />
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Email"
                  required
                />
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Nueva contraseña (opcional)"
                />
                <div className="user-edit-actions">
                  <button type="submit">Guardar</button>
                  <button type="button" onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
                {editError && <p className="error">{editError}</p>}
              </form>
            </li>
          ) : (
            <li key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <span className="user-email">{user.email}</span>
              </div>
              <div className="user-actions">
                <button type="button" onClick={() => startEdit(user)}>
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(user.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {!loading && !error && users.length === 0 && <p>No hay usuarios todavía.</p>}
    </>
  )
}

export default Users
