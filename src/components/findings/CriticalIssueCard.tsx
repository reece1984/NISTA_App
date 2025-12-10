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
}

export function CriticalIssueCard({ issue, onNavigate }: CriticalIssueCardProps) {
  const category = issue.category || 'General'
  const code = issue.criterion_code || 'N/A'
  const rating = issue.rating?.toUpperCase() || 'RED'
  const summary = issue.finding?.substring(0, 100) || 'Missing evidence'

  return (
    <button
      onClick={onNavigate}
      className="w-full text-left p-3 bg-red-50 border-l-4 border-red-600 rounded-r-lg hover:bg-red-100 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500">{code}</span>
            <span className="text-xs font-semibold text-slate-400 uppercase">{category}</span>
            <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${
              rating === 'RED' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {rating}
            </span>
          </div>
          <h5 className="text-sm font-semibold text-slate-900">{issue.title}</h5>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{summary}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </div>
    </button>
  )
}
