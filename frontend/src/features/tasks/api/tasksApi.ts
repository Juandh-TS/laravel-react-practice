import { request } from '@/api/client'
import type { Priority, Task, TaskFilter, TaskStatus } from '../types'

export const tasksApi = {
  list: (filter?: TaskFilter) => {
    const query = filter && filter !== 'all' ? `?filter=${encodeURIComponent(filter)}` : ''
    return request<Task[]>(`/tasks${query}`)
  },

  create: (data: { title: string; user_id?: number; priority?: Priority; tag_ids?: number[] }) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: Partial<{
      title: string
      completed: boolean
      status: TaskStatus
      priority: Priority
      start_date: string | null
      end_date: string | null
      tag_ids: number[]
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

