import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type User = {
  id: number
  open_id: string
  name: string | null
  email: string | null
  login_method: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
  last_signed_in: string
}

export type AssessmentTemplate = {
  id: number
  name: string
  code: string
  description: string | null
  is_active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

export type Project = {
  id: number
  user_id: number
  project_name: string
  project_value: number | null
  project_sector: string | null
  template_id: number | null
  status: 'draft' | 'processing' | 'completed'
  sponsoring_organisation?: string | null
  delivery_organisation?: string | null
  gateway_review_date?: string | null
  previous_rating?: string | null
  report_template_url?: string | null
  report_template_name?: string | null
  created_at: string
  updated_at: string
}

export type File = {
  id: number
  project_id: number
  file_name: string
  file_type: string
  file_url: string | null
  file_key: string | null
  status: 'uploaded' | 'processing' | 'completed' | 'error'
  uploaded_at: string
  processed_at: string | null
}

export type AssessmentCriterion = {
  id: number
  criterion_code: string
  dimension: string
  category: string
  title: string
  description: string
  assessment_question: string
  template_id: number | null
  weight: number | null
  is_critical: boolean
  created_at: string
}

export type Assessment = {
  id: number
  project_id: number
  criterion_id: number
  rag_rating: 'green' | 'amber' | 'red' | 'pending'
  finding: string | null
  evidence: string | null
  recommendation: string | null
  confidence: number | null
  satisfaction_score: number | null
  created_at: string
  updated_at: string
}

export type ProjectSummary = {
  id: number
  project_id: number
  overall_rating: string
  executive_summary: string | null
  key_strengths: string | null
  critical_issues: string | null
  overall_recommendation: string | null
  created_at: string
  updated_at: string
}
