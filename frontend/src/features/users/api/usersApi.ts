import { request } from '@/api/client'
import type { User, UserInput } from '../types'

export type { UserInput }

export const usersApi = {
  list: () => request<User[]>('/users'),

  create: (data: UserInput) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<UserInput>) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/users/${id}`, {
      method: 'DELETE',
    }),

  toggleActive: (id: number) =>
    request<User>(`/users/${id}/toggle-active`, {
      method: 'PATCH',
    }),
}
