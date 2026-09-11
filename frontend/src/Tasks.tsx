import { useEffect, useState, type FormEvent } from 'react'
import { tasksApi } from './api'
import type { Task } from './types'

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    tasksApi
      .list()
      .then(setTasks)
      .catch(() => setError('No se pudo conectar con la API. ¿Corriste "php artisan serve" en backend/?'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return

    setFormError(null)
    try {
      const task = await tasksApi.create(title.trim())
      setTasks((current) => [task, ...current])
      setTitle('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear la tarea.')
    }
  }

  async function handleToggle(task: Task) {
    try {
      const updated = await tasksApi.toggle(task)
      setTasks((current) => current.map((t) => (t.id === task.id ? updated : t)))
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo actualizar la tarea.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await tasksApi.remove(id)
      setTasks((current) => current.filter((t) => t.id !== id))
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo borrar la tarea.')
    }
  }

  return (
    <>
      <h1>
        Tareas
        {!loading && !error && <span className="count-badge">{tasks.length}</span>}
      </h1>
      <p className="subtitle">React 19 + Vite consumiendo la API de Laravel</p>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          maxLength={255}
        />
        <button type="submit" className="btn">
          Agregar
        </button>
      </form>

      {formError && <p className="error">⚠ {formError}</p>}
      {error && <p className="error">⚠ {error}</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />
              <span className="task-title">{task.title}</span>
            </label>
            <button type="button" className="icon-btn danger" onClick={() => handleDelete(task.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {loading && <p className="state-message">Cargando...</p>}
      {!loading && !error && tasks.length === 0 && (
        <p className="state-message">No hay tareas todavía. Agregá la primera arriba.</p>
      )}
    </>
  )
}

export default Tasks
