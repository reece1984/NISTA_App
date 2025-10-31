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
  openId: string
  name: string | null
  email: string | null
  loginMethod: string | null
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
  lastSignedIn: string
}

export type Project = {
  id: number
  userId: number
  projectName: string
  projectValue: number | null
  projectSector: string | null
  status: 'draft' | 'processing' | 'completed'
  createdAt: string
  updatedAt: string
}

export type File = {
  id: number
  projectId: number
  fileName: string
  fileType: string
  fileUrl: string | null
  fileKey: string | null
  status: 'uploaded' | 'processing' | 'completed' | 'error'
  uploadedAt: string
  processedAt: string | null
}

export type AssessmentCriterion = {
  id: number
  criterionCode: string
  dimension: string
  category: string
  title: string
  description: string
  assessmentQuestion: string
  createdAt: string
}

export type Assessment = {
  id: number
  projectId: number
  criterionId: number
  ragRating: 'green' | 'amber' | 'red' | 'pending'
  finding: string | null
  evidence: string | null
  recommendation: string | null
  confidence: number | null
  createdAt: string
  updatedAt: string
}
