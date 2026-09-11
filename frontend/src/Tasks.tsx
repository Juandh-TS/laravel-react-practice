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
      <h1>Tareas</h1>
      <p className="subtitle">React 19 + Vite consumiendo la API de Laravel</p>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
        />
        <button type="submit">Agregar</button>
      </form>

      {formError && <p className="error">{formError}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Cargando...</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />
              {task.title}
            </label>
            <button type="button" onClick={() => handleDelete(task.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {!loading && !error && tasks.length === 0 && <p>No hay tareas todavía.</p>}
    </>
  )
}

export default Tasks
