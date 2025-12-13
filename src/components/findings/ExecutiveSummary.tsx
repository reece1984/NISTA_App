import { ChevronDown, ChevronRight } from 'lucide-react'
import { CriticalIssueCard } from './CriticalIssueCard'
import { RecommendationCard } from './RecommendationCard'
import ReadinessDonut from './ReadinessDonut'
import MetricsRow from './MetricsRow'
import AssessmentByCase from './AssessmentByCase'

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
  onCreateAction?: (context: {
    criterionId: number
    criterionCode: string
    criterionTitle: string
    caseCategory: string
    finding: string
    recommendation: string
    ragRating: string
  }) => void
  project?: any // Optional project data for gateway date
}

export function ExecutiveSummary({
  assessments,
  isCollapsed,
  onToggle,
  onCriterionClick,
  onCreateAction,
  project
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

  // Calculate readiness score (weighted: GREEN=100%, AMBER=50%, RED=0%)
  const readinessScore = totalCriteria > 0
    ? Math.round(((greenCount * 100) + (amberCount * 50)) / totalCriteria)
    : 0

  // Calculate days to gate
  const calculateDaysToGate = () => {
    if (!project?.gateway_review_date) return null
    const today = new Date()
    const reviewDate = new Date(project.gateway_review_date)
    const diffTime = reviewDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysToGate = calculateDaysToGate()

  // Readiness description based on score
  const readinessDescription = readinessScore < 50
    ? 'Significant work required to achieve gateway readiness'
    : readinessScore < 85
    ? 'Good progress, some areas need attention'
    : 'On track for successful gateway review'

  // Group assessments by case for Assessment by Case section
  const CASE_ORDER = ['Strategic', 'Economic', 'Commercial', 'Financial', 'Management']

  const assessmentsByCase: Record<string, Assessment[]> = {}
  assessments.forEach((assessment) => {
    const category = assessment.category || assessment.assessment_criteria?.category || 'Other'
    if (!assessmentsByCase[category]) {
      assessmentsByCase[category] = []
    }
    assessmentsByCase[category].push(assessment)
  })

  // Create case summaries for Assessment by Case
  const caseSummaries = CASE_ORDER.map(caseName => {
    const caseAssessments = assessmentsByCase[caseName] || []
    const caseGreen = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'GREEN').length
    const caseAmber = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'AMBER').length
    const caseRed = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length
    const caseCritical = caseAssessments.filter(a => {
      const rating = a.rag_rating?.toUpperCase()
      const isCritical = a.is_critical || a.assessment_criteria?.is_critical
      return rating === 'RED' || (rating === 'AMBER' && isCritical)
    }).length

    // Calculate case readiness
    const caseReadiness = caseAssessments.length > 0
      ? Math.round(((caseGreen * 100) + (caseAmber * 50)) / caseAssessments.length)
      : 0

    const caseRating = caseReadiness >= 85 ? 'GREEN' : caseReadiness >= 50 ? 'AMBER' : 'RED'

    // Get key finding from worst criterion
    const worstCriterion = caseAssessments.find(a => a.rag_rating?.toUpperCase() === 'RED') ||
                          caseAssessments.find(a => a.rag_rating?.toUpperCase() === 'AMBER') ||
                          caseAssessments[0]

    return {
      case: caseName,
      rating: caseRating as 'RED' | 'AMBER' | 'GREEN',
      criteriaCount: caseAssessments.length,
      criticalCount: caseCritical,
      keyFinding: worstCriterion?.finding || 'No significant issues identified.'
    }
  }).filter(summary => summary.criteriaCount > 0) // Only include cases with assessments

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
          {/* Readiness Visualization */}
          <div className="py-6 border-b border-slate-200">
            <div className="flex items-start gap-6">
              {/* Readiness Donut */}
              <div className="flex-shrink-0 relative w-32 h-32">
                <ReadinessDonut
                  percentage={readinessScore}
                  rating={overallRating as 'RED' | 'AMBER' | 'GREEN'}
                  size={128}
                />
              </div>

              {/* Readiness Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-slate-900">Gateway Readiness</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    overallRating === 'RED' ? 'bg-red-100 text-red-700' :
                    overallRating === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    Predicted: {overallRating}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  {readinessDescription}
                </p>

                {/* Progress bar showing journey to GREEN */}
                <div className="space-y-2">
                  <div className="relative">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          overallRating === 'RED' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                          overallRating === 'AMBER' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                          'bg-gradient-to-r from-green-500 to-green-400'
                        }`}
                        style={{ width: `${readinessScore}%` }}
                      />
                    </div>
                    {/* GREEN threshold marker */}
                    <div
                      className="absolute top-0 h-3 w-0.5 bg-green-600"
                      style={{ left: '85%' }}
                    />
                  </div>
                  {/* Labels with positive framing */}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Current: {readinessScore}% ready</span>
                    <span className="text-green-600 font-medium">Target: 85% for GREEN</span>
                  </div>
                  {/* Encouraging message */}
                  <p className="text-xs text-slate-500">
                    Address the priority focus areas below to improve your readiness score
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="py-4 border-b border-slate-200">
            <MetricsRow
              readinessScore={readinessScore}
              greenCount={greenCount}
              amberCount={amberCount}
              redCount={redCount}
              daysToGate={daysToGate}
            />
          </div>

          {/* Assessment by Case */}
          {caseSummaries.length > 0 && (
            <div className="py-4 border-b border-slate-200">
              <AssessmentByCase
                caseSummaries={caseSummaries}
                onCaseClick={(caseName) => {
                  // Scroll to case in detailed findings
                  const element = document.getElementById(`case-${caseName.toLowerCase()}`)
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              />
            </div>
          )}

          {/* Priority Focus Areas */}
          {criticalIssues.length > 0 && (
            <div className="mb-6">
              <div className="mb-3">
                <h4 className="text-lg font-semibold text-slate-900">Priority Focus Areas</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Focus on these {criticalIssues.length} {criticalIssues.length === 1 ? 'area' : 'areas'} to strengthen your gateway readiness
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {criticalIssues.map((issue, index) => (
                  <CriticalIssueCard
                    key={issue.id}
                    issue={issue}
                    onNavigate={() => onCriterionClick?.(issue.id)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {recommendations.length > 0 && (
            <div>
              <div className="mb-3">
                <h4 className="text-lg font-semibold text-slate-900">Recommended Actions</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {overallRating === 'RED'
                    ? 'Address these to improve your predicted rating'
                    : 'Consider these actions to optimize your gateway review outcome'}
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => {
                  const issue = criticalIssues.find(i => i.id === rec.id)
                  return (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      number={index + 1}
                      onCreateAction={() => issue && onCreateAction?.({
                        criterionId: issue.id,
                        criterionCode: issue.criterion_code || 'N/A',
                        criterionTitle: issue.title,
                        caseCategory: issue.category || 'Strategic',
                        finding: issue.finding || '',
                        recommendation: rec.description,
                        ragRating: issue.rating || 'RED',
                      })}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
