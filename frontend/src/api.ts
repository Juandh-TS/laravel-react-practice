import type { Task } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const tasksApi = {
  list: () => request<Task[]>('/tasks'),

  create: (title: string) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  toggle: (task: Task) =>
    request<Task>(`/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !task.completed }),
    }),

  remove: (id: number) =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
}
