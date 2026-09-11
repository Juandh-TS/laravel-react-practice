export interface Task {
  id: number
  title: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}
