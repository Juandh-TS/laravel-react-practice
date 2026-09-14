export type TaskFilter = 'all' | 'assigned_to_me' | 'assigned_by_me'

export interface Task {
  id: number
  title: string
  completed: boolean
  user_id: number
  company_id: number | null
  assigned_by_user_id?: number | null
  user?: { id: number; name: string } | null
  assigned_by?: { id: number; name: string } | null
  assignedBy?: { id: number; name: string } | null
  assigned_at?: string | null
  assignedAt?: string | null
  created_at: string
  updated_at: string
}
