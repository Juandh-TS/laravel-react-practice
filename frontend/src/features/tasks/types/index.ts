export type TaskFilter = 'all' | 'assigned_to_me' | 'assigned_by_me'

// Statuses and priorities are admin-managed per company (see BoardSettingsPanel);
// slugs are stable identifiers, `TaskStatusOption`/`PriorityOption` carry the
// display label/color/order fetched from the API.
export type TaskStatus = string

export type Priority = string

export interface TaskStatusOption {
  id: number
  slug: string
  label: string
  color: string
  position: number
  is_done: boolean
}

export interface PriorityOption {
  id: number
  slug: string
  label: string
  color: string
  position: number
}

export interface Tag {
  id: number
  name: string
  color: string
  company_id?: number | null
}

export interface Task {
  id: number
  title: string
  completed: boolean
  status: TaskStatus
  priority: Priority
  position: number | null
  start_date: string | null
  end_date: string | null
  comments_count?: number
  user_id: number
  company_id: number | null
  assigned_by_user_id?: number | null
  user?: { id: number; name: string } | null
  assigned_by?: { id: number; name: string } | null
  assigned_at?: string | null
  tags?: Tag[]
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

