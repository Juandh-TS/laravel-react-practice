import { useEffect, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/features/auth/context/AuthContext'
import { tasksApi } from './api/tasksApi'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import type { Task } from './types'

export function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    tasksApi
      .list()
      .then(setTasks)
      .catch(() => setError('No se pudo conectar con la API. Asegurate que el backend esté corriendo.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(title: string) {
    setFormError(null)
    try {
      const task = await tasksApi.create(title)
      setTasks((current) => [task, ...current])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear la tarea.')
      throw err
    }
  }

  async function handleToggle(task: Task) {
    const previousCompleted = task.completed

    // Optimistic update: cambiar inmediatamente en la UI
    setTasks((current) =>
      current.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    )

    try {
      const updated = await tasksApi.toggle(task)
      setTasks((current) => current.map((t) => (t.id === task.id ? updated : t)))
    } catch (err) {
      // Revertir estado en caso de error
      setTasks((current) =>
        current.map((t) => (t.id === task.id ? { ...t, completed: previousCompleted } : t))
      )
      setFormError(err instanceof Error ? err.message : 'No se pudo actualizar la tarea.')
    }
  }

  async function handleUpdate(id: number, title: string) {
    try {
      const updated = await tasksApi.update(id, { title })
      setTasks((current) => current.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo actualizar la tarea.')
      throw err
    }
  }

  async function handleDelete(id: number) {
    const deletedTask = tasks.find((t) => t.id === id)

    // Optimistic update: quitar inmediatamente de la lista
    setTasks((current) => current.filter((t) => t.id !== id))

    try {
      await tasksApi.remove(id)
    } catch (err) {
      // Revertir agregando la tarea si falló la petición
      if (deletedTask) {
        setTasks((current) => [deletedTask, ...current])
      }
      setFormError(err instanceof Error ? err.message : 'No se pudo borrar la tarea.')
    }
  }

  return (
    <>
      <h1>
        Tareas
        {!loading && !error && <Badge count={tasks.length} />}
      </h1>
      <p className="subtitle">Gestiona tus tareas diarias</p>

      <TaskForm onSubmit={handleCreate} />

      <ErrorAlert message={formError} />
      <ErrorAlert message={error} />

      {loading && <Spinner message="Cargando tareas..." />}

      {!loading && !error && tasks.length === 0 && (
        <p className="state-message">No hay tareas pendientes. ¡Agrega una!</p>
      )}

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            currentUserId={user?.id}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </>
  )
}
