import { useState, type FormEvent } from 'react'

interface TaskFormProps {
  onSubmit: (title: string) => Promise<void>
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(trimmed)
      setTitle('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nueva tarea..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
      />
      <button type="submit" className="btn primary" disabled={isSubmitting || !title.trim()}>
        {isSubmitting ? 'Guardando...' : 'Agregar'}
      </button>
    </form>
  )
}
