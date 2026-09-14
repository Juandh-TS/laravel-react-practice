import { useState, type FormEvent } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Company } from '../types'

interface CompanyItemProps {
  company: Company
  onUpdate: (id: number, name: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function CompanyItem({ company, onUpdate, onDelete }: CompanyItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(company.name)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleConfirmDelete() {
    setIsDeleting(true)
    try {
      await onDelete(company.id)
      setConfirmingDelete(false)
    } finally {
      setIsDeleting(false)
    }
  }

  function startEdit() {
    setEditName(company.name)
    setIsEditing(true)
  }

  function cancelEdit() {
    setEditName(company.name)
    setIsEditing(false)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    const trimmed = editName.trim()
    if (!trimmed || isSaving) return

    setIsSaving(true)
    try {
      await onUpdate(company.id, trimmed)
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
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Nombre de la empresa"
            required
            disabled={isSaving}
          />
          <div className="user-edit-actions">
            <button type="submit" className="btn primary" disabled={isSaving || !editName.trim()}>
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

  const usersCount = company.users_count ?? 0

  return (
    <li>
      <div className="user-content">
        <span className="user-avatar">{company.name.charAt(0).toUpperCase()}</span>
        <div className="user-details">
          <strong>{company.name}</strong>
          <span className="user-email">
            {usersCount} {usersCount === 1 ? 'usuario' : 'usuarios'}
          </span>
        </div>
      </div>
      <div className="user-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={startEdit}
          aria-label="Editar empresa"
        >
          ✎
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Borrar empresa"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Borrar empresa"
        description={`¿Seguro que quieres borrar "${company.name}"? Esta acción no se puede deshacer.`}
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  )
}
