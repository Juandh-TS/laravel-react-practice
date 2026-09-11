import type { Company } from '@/features/companies/types'

export interface User {
  id: number
  name: string
  email: string
  company_id: number | null
  company: Company | null
  created_at: string
  updated_at: string
}

export interface UserInput {
  name: string
  email: string
  password?: string
  company_id?: number | null
}
