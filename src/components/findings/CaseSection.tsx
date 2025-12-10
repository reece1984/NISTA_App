import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { CriterionRow } from './CriterionRow'

interface Criterion {
  id: number
  code?: string
  criterion_code?: string
  title: string
  rag_rating: string
  finding?: string
  satisfaction?: number
  confidence?: number
  weight?: number
  is_critical?: boolean
  evidence_requirements?: any[]
  gaps?: any[]
  green_standard?: string
  recommendation?: string
  assessment_criteria?: any
}

interface CaseSectionProps {
  caseCategory: string
  criteria: Criterion[]
  expandedCriteria: number[]
  setExpandedCriteria: (ids: number[]) => void
  onCreateAction?: (criterion: Criterion) => void
}

export function CaseSection({
  caseCategory,
  criteria,
  expandedCriteria,
  setExpandedCriteria,
  onCreateAction
}: CaseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const ratingCounts = {
    green: criteria.filter(c => c.rag_rating?.toUpperCase() === 'GREEN').length,
    amber: criteria.filter(c => c.rag_rating?.toUpperCase() === 'AMBER').length,
    red: criteria.filter(c => c.rag_rating?.toUpperCase() === 'RED').length,
  }

  const handleCriterionToggle = (criterionId: number) => {
    if (expandedCriteria.includes(criterionId)) {
      setExpandedCriteria(expandedCriteria.filter(id => id !== criterionId))
    } else {
      setExpandedCriteria([...expandedCriteria, criterionId])
    }
  }

  return (
    <div>
      {/* Case header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-900">{caseCategory}</h3>
            <p className="text-xs text-slate-500">{criteria.length} criteria assessed</p>
          </div>
        </div>

        {/* Rating dots */}
        <div className="flex items-center gap-1">
          {Array(ratingCounts.green).fill(null).map((_, i) => (
            <span key={`g-${i}`} className="w-2 h-2 rounded-full bg-green-500" />
          ))}
          {Array(ratingCounts.amber).fill(null).map((_, i) => (
            <span key={`a-${i}`} className="w-2 h-2 rounded-full bg-amber-500" />
          ))}
          {Array(ratingCounts.red).fill(null).map((_, i) => (
            <span key={`r-${i}`} className="w-2 h-2 rounded-full bg-red-500" />
          ))}
        </div>
      </button>

      {/* Criteria list */}
      {isExpanded && (
        <div className="pl-12 pr-4 pb-4 space-y-2">
          {criteria.map((criterion) => (
            <CriterionRow
              key={criterion.id}
              criterion={criterion}
              isExpanded={expandedCriteria.includes(criterion.id)}
              onToggle={() => handleCriterionToggle(criterion.id)}
              onCreateAction={onCreateAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
