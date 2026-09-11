import { useState, type KeyboardEvent, type MouseEvent, type SyntheticEvent } from 'react'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onUpdate: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => void
}

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [isSaving, setIsSaving] = useState(false)

  function startEditing() {
    setEditTitle(task.title)
    setIsEditing(true)
  }

  function cancelEditing() {
    setEditTitle(task.title)
    setIsEditing(false)
  }

  function handleDoubleClick(e: MouseEvent<HTMLLIElement>) {
    const target = e.target as HTMLElement
    // Ignore double click if clicking directly on buttons or checkboxes
    if (target.closest('button') || target.tagName === 'INPUT') {
      return
    }
    startEditing()
  }

  async function handleSave(e?: SyntheticEvent) {
    e?.preventDefault()
    const trimmed = editTitle.trim()

    if (!trimmed || isSaving) return

    if (trimmed === task.title) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(task.id, trimmed)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      cancelEditing()
    } else if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <li
      className={`task-item ${task.completed ? 'completed done' : ''} ${isEditing ? 'editing' : ''} ${isSaving ? 'saving' : ''}`}
      onDoubleClick={handleDoubleClick}
      title={!isEditing ? 'Doble clic para editar' : undefined}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="task-edit-form">
          <input
            type="text"
            className="edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            disabled={isSaving}
          />
        </form>
      ) : (
        <>
          <div className="task-content">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task)}
              aria-label={`Marcar como completada: ${task.title}`}
            />
            <span className="task-title">
              {task.title}
            </span>
          </div>
          <div className="task-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={startEditing}
              aria-label="Editar tarea"
              title="Editar tarea"
            >
              ✎
            </button>
            <button
              type="button"
              className="icon-btn danger"
              onClick={() => onDelete(task.id)}
              aria-label="Borrar tarea"
              title="Borrar tarea"
            >
              ✕
            </button>
          </div>
        </>
      )}
    </li>
  )
}
