import { cn } from '../../lib/utils'

interface OverallRatingCardProps {
  overallRating: 'green' | 'amber' | 'red' | 'pending'
  readinessPercentage: number
  executiveSummary: string | null
  keyStrengths?: string | null
  criticalIssues?: string | null
  overallRecommendation?: string | null
  totalCriteria: number
}

export default function OverallRatingCard({
  overallRating,
  readinessPercentage,
  executiveSummary,
  keyStrengths,
  criticalIssues,
  overallRecommendation,
  totalCriteria,
}: OverallRatingCardProps) {
  const getRagBadge = (rating: string) => {
    const badges = {
      green: 'bg-emerald-500 text-white shadow-lg min-w-[140px]',
      amber: 'bg-amber-500 text-white shadow-lg min-w-[140px]',
      red: 'bg-red-500 text-white shadow-lg min-w-[140px]',
      pending: 'bg-slate-300 text-slate-700 shadow-lg min-w-[140px]',
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
                'px-8 py-4 rounded-2xl font-bold text-3xl text-center inline-flex items-center justify-center',
                getRagBadge(overallRating)
              )}
            >
              {getRagLabel(overallRating)}
            </span>
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

      {keyStrengths && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Key Strengths
            </h4>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {keyStrengths}
          </p>
        </div>
      )}

      {criticalIssues && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Critical Issues
            </h4>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {criticalIssues}
          </p>
        </div>
      )}

      {overallRecommendation && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Overall Recommendation
            </h4>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {overallRecommendation}
          </p>
        </div>
      )}
    </div>
  )
}
