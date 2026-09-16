import { request } from '@/api/client'
import type { PriorityOption } from '../types'

export const taskPrioritiesApi = {
  list: () => request<PriorityOption[]>('/task-priorities'),

  create: (label: string, color?: string) =>
    request<PriorityOption>('/task-priorities', {
      method: 'POST',
      body: JSON.stringify({ label, color }),
    }),

  update: (id: number, data: Partial<{ label: string; color: string; position: number }>) =>
    request<PriorityOption>(`/task-priorities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/task-priorities/${id}`, {
      method: 'DELETE',
    }),
}
