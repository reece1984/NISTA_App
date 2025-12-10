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
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
      <div className="w-6 h-6 rounded-full bg-copper text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">{recommendation.title}</span>
          {recommendation.description && (
            <span> {recommendation.description}</span>
          )}
        </p>
        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded uppercase ${
          priority === 'high' ? 'bg-red-600 text-white' :
          priority === 'medium' ? 'bg-amber-500 text-white' :
          'bg-slate-400 text-white'
        }`}>
          {priority} Priority
        </span>
      </div>
      {onCreateAction && (
        <button
          onClick={onCreateAction}
          className="flex-shrink-0 text-sm text-copper hover:text-[#a85d32] font-medium flex items-center gap-1 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Action
        </button>
      )}
    </div>
  )
}
