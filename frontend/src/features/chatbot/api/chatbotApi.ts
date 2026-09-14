import { request } from '@/api/client'
import type { ChatMessage } from '../types'

export const chatbotApi = {
  ask: (message: string, history: ChatMessage[]) =>
    request<{ message: string }>('/chatbot/ask', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
}
