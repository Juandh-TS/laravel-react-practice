import { request } from '@/api/client'
import type { Comment } from '../types'

export const commentsApi = {
  list: (taskId: number) => request<Comment[]>(`/tasks/${taskId}/comments`),

  create: (taskId: number, body: string) =>
    request<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  remove: (taskId: number, commentId: number) =>
    request<void>(`/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
}
