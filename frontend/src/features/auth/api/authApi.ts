import { request } from '@/api/client'
import type { AuthResponse, LoginInput, RegisterInput, User } from '../types'

export const authApi = {
  register: (data: RegisterInput) =>
    request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginInput) =>
    request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<void>('/logout', {
      method: 'POST',
    }),

  me: () => request<User>('/me'),
}
