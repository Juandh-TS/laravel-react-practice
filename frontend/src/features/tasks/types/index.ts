export interface Task {
  id: number
  title: string
  completed: boolean
  user_id: number
  company_id: number | null
  user?: { id: number; name: string } | null
  created_at: string
  updated_at: string
}
