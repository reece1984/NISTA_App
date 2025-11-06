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
      green: 'bg-rag-green text-white',
      amber: 'bg-rag-amber text-white',
      red: 'bg-rag-red text-white',
      pending: 'bg-gray-300 text-gray-700',
    }
    return badges[rating as keyof typeof badges] || badges.pending
  }

  const getRagLabel = (rating: string) => {
    return rating.charAt(0).toUpperCase() + rating.slice(1)
  }

  return (
    <div className="card bg-gradient-to-br from-secondary/10 via-secondary/5 to-accent/5 border-l-4 border-secondary">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">
            Overall Assessment Rating
          </h3>
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'px-6 py-3 rounded-xl font-bold text-2xl shadow-lg',
                getRagBadge(overallRating)
              )}
            >
              {getRagLabel(overallRating)}
            </span>
            <div>
              <div className="text-4xl font-bold text-text-primary">
                {readinessPercentage}%
              </div>
              <div className="text-sm text-text-secondary">Ready</div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-secondary">
            {totalCriteria}
          </div>
          <div className="text-sm text-text-secondary">Criteria Assessed</div>
        </div>
      </div>

      {executiveSummary && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-text-secondary leading-relaxed">
            {executiveSummary}
          </p>
        </div>
      )}
    </div>
  )
}
