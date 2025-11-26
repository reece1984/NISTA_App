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
      amber: 'bg-amber-500 text-white shadow-sm',
      red: 'bg-red-500 text-white shadow-sm',
    }
    return badges[rating as keyof typeof badges] || 'bg-slate-300 text-slate-700'
  }

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return 'No finding available'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 h-full">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-sm">
          <AlertCircle className="text-white" size={18} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Priority Actions
        </h3>
      </div>
      <p className="text-sm text-slate-600 mb-4">Critical items requiring attention</p>

      {priorityAssessments.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-slate-900 font-semibold">No critical issues found!</p>
          <p className="text-sm text-slate-600 mt-1">
            All criteria are rated green
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {priorityAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
              onClick={() => onViewDetails && onViewDetails(assessment.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {assessment.assessment_criteria.criterion_code}
                    </span>
                    {assessment.assessment_criteria.is_critical && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        CRITICAL
                      </span>
                    )}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-lg text-xs font-bold',
                        getRagBadge(assessment.rag_rating)
                      )}
                    >
                      {assessment.rag_rating.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-1 truncate">
                    {assessment.assessment_criteria.title}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {truncateText(assessment.finding, 100)}
                  </p>
                </div>
                <ChevronRight className="flex-shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors" size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      {priorityAssessments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Showing top {priorityAssessments.length} priority{' '}
            {priorityAssessments.length === 1 ? 'action' : 'actions'}
          </p>
        </div>
      )}
    </div>
  )
}
