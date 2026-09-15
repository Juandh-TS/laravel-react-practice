export type TaskFilter = 'all' | 'assigned_to_me' | 'assigned_by_me'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  done: 'Hecho',
}

export interface Task {
  id: number
  title: string
  completed: boolean
  status: TaskStatus
  start_date: string | null
  end_date: string | null
  comments_count?: number
  user_id: number
  company_id: number | null
  assigned_by_user_id?: number | null
  user?: { id: number; name: string } | null
  assigned_by?: { id: number; name: string } | null
  assigned_at?: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  task_id: number
  body: string
  user: { id: number; name: string } | null
  created_at: string
  updated_at: string
}
