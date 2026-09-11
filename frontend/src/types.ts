export interface Task {
  id: number
  title: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: number
  name: string
  users_count?: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  company_id: number | null
  company: Company | null
  created_at: string
  updated_at: string
}
