import { useEffect, useState, type FormEvent } from 'react'
import { companiesApi } from './api'
import type { Company } from './types'

function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    companiesApi
      .list()
      .then(setCompanies)
      .catch(() => setError('No se pudo conectar con la API. ¿Corriste "php artisan serve" en backend/?'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    setFormError(null)
    try {
      const company = await companiesApi.create({ name: name.trim() })
      setCompanies((current) => [{ ...company, users_count: 0 }, ...current])
      setName('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear la empresa.')
    }
  }

  function startEdit(company: Company) {
    setEditingId(company.id)
    setEditName(company.name)
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditError(null)
  }

  async function handleUpdate(event: FormEvent, id: number) {
    event.preventDefault()
    setEditError(null)

    try {
      const updated = await companiesApi.update(id, { name: editName.trim() })
      setCompanies((current) =>
        current.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      )
      cancelEdit()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo actualizar la empresa.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await companiesApi.remove(id)
      setCompanies((current) => current.filter((c) => c.id !== id))
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo borrar la empresa.')
    }
  }

  return (
    <>
      <h1>
        Empresas
        {!loading && !error && <span className="count-badge">{companies.length}</span>}
      </h1>
      <p className="subtitle">Asociá usuarios a una empresa desde la pestaña Usuarios</p>

      <form className="user-form" onSubmit={handleCreate}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la empresa"
          maxLength={255}
          required
        />
        <button type="submit" className="btn">
          Agregar
        </button>
      </form>

      {formError && <p className="error">⚠ {formError}</p>}
      {error && <p className="error">⚠ {error}</p>}

      <ul className="user-list">
        {companies.map((company) =>
          editingId === company.id ? (
            <li key={company.id}>
              <form className="user-edit-form" onSubmit={(e) => handleUpdate(e, company.id)}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nombre de la empresa"
                  maxLength={255}
                  required
                />
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
            <li key={company.id}>
              <div className="user-info">
                <span className="user-avatar">{company.name.charAt(0).toUpperCase()}</span>
                <div className="user-details">
                  <strong>{company.name}</strong>
                  <span className="user-email">
                    {company.users_count ?? 0}{' '}
                    {(company.users_count ?? 0) === 1 ? 'usuario' : 'usuarios'}
                  </span>
                </div>
              </div>
              <div className="user-actions">
                <button type="button" className="icon-btn" onClick={() => startEdit(company)}>
                  Editar
                </button>
                <button type="button" className="icon-btn danger" onClick={() => handleDelete(company.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {loading && <p className="state-message">Cargando...</p>}
      {!loading && !error && companies.length === 0 && (
        <p className="state-message">No hay empresas todavía. Agregá la primera arriba.</p>
      )}
    </>
  )
}

export default Companies
