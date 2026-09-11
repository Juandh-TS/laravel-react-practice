import { request } from '@/api/client'
import type { Task } from '../types'

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
