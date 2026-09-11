import { request } from '@/api/client'
import type { Company } from '../types'

export const companiesApi = {
  list: () => request<Company[]>('/companies'),

  create: (data: { name: string }) =>
    request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { name: string }) =>
    request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/companies/${id}`, {
      method: 'DELETE',
    }),
}
