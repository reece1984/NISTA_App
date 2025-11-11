import { AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Assessment {
  id: number
  rag_rating: 'green' | 'amber' | 'red' | 'pending'
  finding: string | null
  assessment_criteria: {
    criterion_code: string
    title: string
    is_critical: boolean
  }
}

interface PriorityActionsCardProps {
  assessments: Assessment[]
  onViewDetails?: (assessmentId: number) => void
}

export default function PriorityActionsCard({
  assessments,
  onViewDetails,
}: PriorityActionsCardProps) {
  // Get red and amber assessments, prioritizing critical ones and red ratings
  const priorityAssessments = assessments
    .filter((a) => a.rag_rating === 'red' || a.rag_rating === 'amber')
    .sort((a, b) => {
      // Critical items first
      if (a.assessment_criteria.is_critical && !b.assessment_criteria.is_critical) return -1
      if (!a.assessment_criteria.is_critical && b.assessment_criteria.is_critical) return 1

      // Then red before amber
      if (a.rag_rating === 'red' && b.rag_rating !== 'red') return -1
      if (a.rag_rating !== 'red' && b.rag_rating === 'red') return 1

      return 0
    })
    .slice(0, 5) // Top 5

  const getRagBadge = (rating: string) => {
    const badges = {
      amber: 'bg-rag-amber text-white',
      red: 'bg-rag-red text-white',
    }
    return badges[rating as keyof typeof badges] || 'bg-gray-300 text-gray-700'
  }

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return 'No finding available'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="card h-full">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="text-rag-red" size={20} />
        <h3 className="text-lg font-semibold text-text-primary">
          Priority Actions
        </h3>
      </div>

      {priorityAssessments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-text-secondary">No critical issues found!</p>
          <p className="text-sm text-text-secondary mt-1">
            All criteria are rated green.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {priorityAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="p-3 rounded-lg border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all cursor-pointer"
              onClick={() => onViewDetails && onViewDetails(assessment.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-text-secondary">
                      {assessment.assessment_criteria.criterion_code}
                    </span>
                    {assessment.assessment_criteria.is_critical && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-rag-red/10 text-rag-red border border-rag-red/30">
                        CRITICAL
                      </span>
                    )}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-semibold',
                        getRagBadge(assessment.rag_rating)
                      )}
                    >
                      {assessment.rag_rating.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1 truncate">
                    {assessment.assessment_criteria.title}
                  </p>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {truncateText(assessment.finding, 100)}
                  </p>
                </div>
                <ChevronRight className="flex-shrink-0 text-text-secondary" size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      {priorityAssessments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-text-secondary">
            Showing top {priorityAssessments.length} priority{' '}
            {priorityAssessments.length === 1 ? 'action' : 'actions'}
          </p>
        </div>
      )}
    </div>
  )
}
