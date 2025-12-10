import { ChevronDown, ChevronRight } from 'lucide-react'
import { CriticalIssueCard } from './CriticalIssueCard'
import { RecommendationCard } from './RecommendationCard'

interface Assessment {
  id: number
  title: string
  rag_rating: string
  finding?: string
  category?: string
  criterion_code?: string
  assessment_criteria?: {
    title: string
    is_critical: boolean
    category: string
    criterion_code: string
  }
  is_critical?: boolean
}

interface ExecutiveSummaryProps {
  assessments: Assessment[]
  isCollapsed: boolean
  onToggle: () => void
  onCriterionClick?: (criterionId: number) => void
  onCreateAction?: (recommendation: any) => void
}

export function ExecutiveSummary({
  assessments,
  isCollapsed,
  onToggle,
  onCriterionClick,
  onCreateAction
}: ExecutiveSummaryProps) {
  // Calculate overall metrics
  const totalCriteria = assessments.length
  const greenCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'GREEN').length
  const amberCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'AMBER').length
  const redCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length

  // Count critical issues (RED or critical AMBER)
  const criticalCount = assessments.filter(a => {
    const rating = a.rag_rating?.toUpperCase()
    const isCritical = a.is_critical || a.assessment_criteria?.is_critical
    return rating === 'RED' || (rating === 'AMBER' && isCritical)
  }).length

  // Determine overall rating
  const overallRating = criticalCount > 0 || redCount >= 3 ? 'RED' :
                       amberCount >= 5 ? 'AMBER' : 'GREEN'

  const ratingText = overallRating === 'RED' ? 'Not Ready to Proceed' :
                    overallRating === 'AMBER' ? 'Conditionally Ready' : 'Ready to Proceed'

  const ratingSubtext = overallRating === 'RED' ? 'Critical issues require resolution' :
                       overallRating === 'AMBER' ? 'Minor issues to address' : 'All criteria satisfied'

  // Get critical issues for display
  const criticalIssues = assessments
    .filter(a => {
      const rating = a.rag_rating?.toUpperCase()
      const isCritical = a.is_critical || a.assessment_criteria?.is_critical
      return rating === 'RED' || (rating === 'AMBER' && isCritical)
    })
    .slice(0, 8)
    .map(a => ({
      id: a.id,
      criterion_code: a.criterion_code || a.assessment_criteria?.criterion_code,
      title: a.title || a.assessment_criteria?.title || 'Untitled Criterion',
      category: a.category || a.assessment_criteria?.category,
      rating: a.rag_rating,
      finding: a.finding,
      is_critical: a.is_critical || a.assessment_criteria?.is_critical
    }))

  // Generate recommendations (simplified version)
  const recommendations = criticalIssues.slice(0, 4).map((issue, index) => ({
    id: issue.id,
    title: `Address ${issue.title}`,
    description: 'by providing comprehensive evidence and documentation',
    priority: issue.rating?.toUpperCase() === 'RED' ? 'high' as const : 'medium' as const
  }))

  // Generate executive summary text
  const summaryText = overallRating === 'RED'
    ? `The overall assessment rating is RED due to ${criticalCount} critical ${criticalCount === 1 ? 'issue' : 'issues'}. While the project demonstrates structured arrangements, significant risks must be urgently addressed before proceeding to the next gate.`
    : overallRating === 'AMBER'
    ? `The project shows good progress with ${greenCount} criteria rated GREEN, but ${amberCount} areas require attention before achieving full readiness. Address the highlighted concerns to strengthen your gateway submission.`
    : `Excellent progress! The project meets all ${totalCriteria} criteria and is ready to proceed. The comprehensive evidence demonstrates strong alignment with IPA standards.`

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
          <h2 className="text-base font-semibold text-slate-900">Executive Summary</h2>
        </div>
        <span className="text-sm text-slate-500">
          {isCollapsed ? 'Expand' : 'Collapse'}
        </span>
      </button>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="px-6 pb-5 border-t border-slate-100">
          {/* Rating banner */}
          <div className="flex items-start gap-6 py-4">
            {/* Rating badge */}
            <div className={`flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center ${
              overallRating === 'RED' ? 'bg-red-600' :
              overallRating === 'AMBER' ? 'bg-amber-500' : 'bg-green-600'
            }`}>
              <span className="text-white text-base font-bold uppercase">
                {overallRating}
              </span>
            </div>

            {/* Rating description */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{ratingText}</h3>
              <p className="text-sm text-slate-500 mt-1">{ratingSubtext}</p>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                {summaryText}
              </p>
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 text-right">
              <div className="mb-2">
                <span className="text-2xl font-bold text-slate-900">{totalCriteria}</span>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Assessed</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-red-600">{criticalCount}</span>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Critical</p>
              </div>
            </div>
          </div>

          {/* Critical Issues */}
          {criticalIssues.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900">Critical Issues</h4>
                <span className="text-xs text-slate-500">
                  {criticalIssues.length} criteria {criticalIssues.length === 1 ? 'rated' : 'require'} attention
                </span>
              </div>
              <div className="space-y-3">
                {criticalIssues.map((issue) => (
                  <CriticalIssueCard
                    key={issue.id}
                    issue={issue}
                    onNavigate={() => onCriterionClick?.(issue.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900">Recommendations</h4>
                <span className="text-xs text-slate-500">
                  {overallRating === 'RED' ? 'Do not proceed until addressed' : 'Address before gateway review'}
                </span>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    number={index + 1}
                    onCreateAction={() => onCreateAction?.(rec)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
