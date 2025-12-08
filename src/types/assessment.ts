// Assessment types for NISTA App

export interface EvidenceRequirement {
  id: number
  criterion_id: number
  evidence_text: string
  evidence_type: 'document' | 'demonstration' | 'verification'
  document_types: string[]
  is_mandatory: boolean
  quality_indicators: string[]
  red_flags: string[]
  display_order: number
}

export interface EvidenceAssessmentItem {
  evidence_requirement_id: number
  status: 'found' | 'partial' | 'missing'
  found_indicators: string[]
  missing_indicators: string[]
  source_refs: Array<{ doc: string; page: number }>
}

export interface QualityRubric {
  RED: string
  AMBER: string
  GREEN: string
  evidence_indicators?: {
    GREEN: string[]
    RED: string[]
  }
  document_signals?: string[]
}

export interface CriterionAssessmentWithEvidence {
  id: number
  criterion_id: number
  rating: 'GREEN' | 'AMBER' | 'RED'
  confidence: number
  satisfaction: number
  finding: string
  recommendation: string
  evidence_quotes: Array<{ text: string; source: string; page: number }>
  evidence_assessment: EvidenceAssessmentItem[]
  criterion: {
    id: number
    criterion_code: string
    title: string
    quality_rubric: QualityRubric
  }
  evidence_requirements: EvidenceRequirement[]
}
