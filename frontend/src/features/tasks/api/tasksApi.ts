import { request } from '@/api/client'
import type { Task, TaskFilter } from '../types'

export const tasksApi = {
  list: (filter?: TaskFilter) => {
    const query = filter && filter !== 'all' ? `?filter=${encodeURIComponent(filter)}` : ''
    return request<Task[]>(`/tasks${query}`)
  },

  create: (title: string, userId?: number) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, user_id: userId }),
    }),

  update: (id: number, data: Partial<{ title: string, completed: boolean }>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
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
