import type { Company, Task, User } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

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

export interface UserInput {
  name: string
  email: string
  password?: string
  company_id?: number | null
}

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
}

export interface CompanyInput {
  name: string
}

export const companiesApi = {
  list: () => request<Company[]>('/companies'),

  create: (data: CompanyInput) =>
    request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CompanyInput>) =>
    request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/companies/${id}`, {
      method: 'DELETE',
    }),
}
