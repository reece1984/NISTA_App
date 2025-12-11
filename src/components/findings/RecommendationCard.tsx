import { Plus } from 'lucide-react'

interface Recommendation {
  id?: number
  title: string
  description: string
  priority?: 'high' | 'medium' | 'low'
}

interface RecommendationCardProps {
  recommendation: Recommendation
  number: number
  onCreateAction?: () => void
}

export function RecommendationCard({ recommendation, number, onCreateAction }: RecommendationCardProps) {
  const priority = recommendation.priority || 'high'

  return (
    <div className="h-full flex flex-col p-3 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: '#c2703e', color: 'white' }}>
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 line-clamp-3">
            <span className="font-semibold">{recommendation.title}</span>
            {recommendation.description && (
              <span> {recommendation.description}</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200">
        <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${
          priority === 'high' ? 'bg-slate-100 text-slate-700' :
          priority === 'medium' ? 'bg-slate-100 text-slate-600' :
          'bg-slate-50 text-slate-500'
        }`}>
          {priority === 'high' ? 'High Priority' : priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
        </span>
        {onCreateAction && (
          <button
            onClick={onCreateAction}
            className="flex-shrink-0 text-sm font-medium flex items-center gap-1 transition-colors"
            style={{ color: '#c2703e' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#a85d32'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#c2703e'}
          >
            <Plus className="w-4 h-4" />
            Create Action
          </button>
        )}
      </div>
    </div>
  )
}
