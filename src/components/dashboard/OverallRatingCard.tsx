import { cn } from '../../lib/utils'

interface OverallRatingCardProps {
  overallRating: 'green' | 'amber' | 'red' | 'pending'
  readinessPercentage: number
  executiveSummary: string | null
  totalCriteria: number
}

export default function OverallRatingCard({
  overallRating,
  readinessPercentage,
  executiveSummary,
  totalCriteria,
}: OverallRatingCardProps) {
  const getRagBadge = (rating: string) => {
    const badges = {
      green: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30',
      amber: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30',
      red: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30',
      pending: 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 shadow-lg',
    }
    return badges[rating as keyof typeof badges] || badges.pending
  }

  const getRagLabel = (rating: string) => {
    return rating.charAt(0).toUpperCase() + rating.slice(1)
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">
            Overall Assessment Rating
          </h3>
          <div className="flex items-center gap-6">
            <span
              className={cn(
                'px-8 py-4 rounded-2xl font-bold text-3xl',
                getRagBadge(overallRating)
              )}
            >
              {getRagLabel(overallRating)}
            </span>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {readinessPercentage}%
              </div>
              <div className="text-sm text-slate-600 font-medium mt-1">Ready</div>
            </div>
          </div>
        </div>
        <div className="text-right bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-6 py-4 border border-blue-100">
          <div className="text-4xl font-bold text-slate-900">
            {totalCriteria}
          </div>
          <div className="text-sm text-slate-600 font-medium">Criteria Assessed</div>
        </div>
      </div>

      {executiveSummary && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-slate-700 leading-relaxed">
            {executiveSummary}
          </p>
        </div>
      )}
    </div>
  )
}
