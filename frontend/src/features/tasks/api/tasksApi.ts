import { request } from '@/api/client'
import type { Task, TaskFilter, TaskStatus } from '../types'

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

  update: (
    id: number,
    data: Partial<{
      title: string
      completed: boolean
      status: TaskStatus
      start_date: string | null
      end_date: string | null
    }>,
  ) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
}
