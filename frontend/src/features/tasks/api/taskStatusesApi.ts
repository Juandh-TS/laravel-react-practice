import { request } from '@/api/client'
import type { TaskStatusOption } from '../types'

export const taskStatusesApi = {
  list: () => request<TaskStatusOption[]>('/task-statuses'),

  create: (label: string, color?: string, isDone?: boolean) =>
    request<TaskStatusOption>('/task-statuses', {
      method: 'POST',
      body: JSON.stringify({ label, color, is_done: isDone }),
    }),

  update: (id: number, data: Partial<{ label: string; color: string; position: number; is_done: boolean }>) =>
    request<TaskStatusOption>(`/task-statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/task-statuses/${id}`, {
      method: 'DELETE',
    }),
}
