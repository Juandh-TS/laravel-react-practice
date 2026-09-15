import { request } from '@/api/client'
import type { Tag } from '../types'

export const tagsApi = {
  list: () => request<Tag[]>('/tags'),

  create: (name: string, color?: string) =>
    request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),

  remove: (id: number) =>
    request<void>(`/tags/${id}`, {
      method: 'DELETE',
    }),
}
