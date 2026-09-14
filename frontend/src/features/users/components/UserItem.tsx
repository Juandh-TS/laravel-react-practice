import { useState, type FormEvent } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Company } from '@/features/companies/types'
import type { User, UserInput } from '../types'

interface UserItemProps {
  user: User
  companies: Company[]
  onUpdate: (id: number, data: Partial<UserInput>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function UserItem({ user, companies, onUpdate, onDelete }: UserItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    password: '',
    companyId: user.company_id ? String(user.company_id) : '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleConfirmDelete() {
    setIsDeleting(true)
    try {
      await onDelete(user.id)
      setConfirmingDelete(false)
    } finally {
      setIsDeleting(false)
    }
  }

  function startEdit() {
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      companyId: user.company_id ? String(user.company_id) : '',
    })
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!editForm.name.trim() || !editForm.email.trim() || isSaving) return

    setIsSaving(true)
    try {
      const payload: Partial<UserInput> = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        company_id: editForm.companyId ? Number(editForm.companyId) : null,
      }
      if (editForm.password) {
        payload.password = editForm.password
      }
      await onUpdate(user.id, payload)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <li>
        <form className="user-edit-form" onSubmit={handleSave}>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Nombre"
            required
            disabled={isSaving}
          />
          <input
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            placeholder="Email"
            required
            disabled={isSaving}
          />
          <input
            type="password"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            placeholder="Nueva contraseña (opcional)"
            disabled={isSaving}
          />
          <select
            value={editForm.companyId}
            onChange={(e) => setEditForm({ ...editForm, companyId: e.target.value })}
            disabled={isSaving}
          >
            <option value="">Sin empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <div className="user-edit-actions">
            <button type="submit" className="btn primary" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn secondary" onClick={cancelEdit} disabled={isSaving}>
              Cancelar
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li>
      <div className="user-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
        <strong>{user.name}</strong>
      </div>
      <div className="user-card">
        <div className="user-details">
          <span className="user-email">{user.email}</span>
          <span className="company-tag" style={{ marginTop: '10px' }}>
            {user.company ? user.company.name : 'Sin empresa'}
          </span>
        </div>
      </div>
      <div className="user-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={startEdit}
          aria-label="Editar usuario"
        >
          ✎
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Borrar usuario"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Borrar usuario"
        description={`¿Seguro que quieres borrar a "${user.name}"? Esta acción no se puede deshacer.`}
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  )
}
