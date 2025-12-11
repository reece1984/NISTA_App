import { ChevronRight } from 'lucide-react'

interface CriticalIssue {
  id: number
  criterion_code?: string
  title: string
  category?: string
  rating: string
  finding?: string
  is_critical?: boolean
}

interface CriticalIssueCardProps {
  issue: CriticalIssue
  onNavigate: () => void
  index?: number // For determining URGENT badge
}

export function CriticalIssueCard({ issue, onNavigate, index }: CriticalIssueCardProps) {
  const category = issue.category || 'General'
  const code = issue.criterion_code || 'N/A'
  const rating = issue.rating?.toUpperCase() || 'RED'
  const summary = issue.finding?.substring(0, 100) || 'Missing evidence'
  const isUrgent = index !== undefined && index < 3 // Top 3 issues are urgent

  return (
    <button
      onClick={onNavigate}
      className="h-full w-full text-left p-4 bg-white border border-slate-200 border-l-4 border-l-red-500 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Priority number + Title */}
          <div className="flex items-start gap-2 mb-2">
            {isUrgent && (
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {(index ?? 0) + 1}
              </span>
            )}
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-slate-900">{issue.title}</h5>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ${
              rating === 'RED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {rating}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2">{summary}</p>

          {/* Case reference */}
          <p className="text-xs text-slate-400 mt-2">
            {category} Case · {code}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}
