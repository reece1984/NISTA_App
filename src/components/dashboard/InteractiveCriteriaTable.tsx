import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Assessment {
  id: number
  rag_rating: 'green' | 'amber' | 'red' | 'pending'
  finding: string | null
  evidence: string | null
  recommendation: string | null
  summary: string | null
  confidence: number | null
  satisfaction_score: number | null
  assessment_criteria: {
    criterion_code: string
    title: string
    dimension: string
    weight: number | null
    is_critical: boolean
  }
}

interface InteractiveCriteriaTableProps {
  assessments: Assessment[]
  expandedId?: number | null
  onExpandToggle?: (id: number | null) => void
}

export default function InteractiveCriteriaTable({
  assessments,
  expandedId: externalExpandedId,
  onExpandToggle,
}: InteractiveCriteriaTableProps) {
  const [internalExpandedId, setInternalExpandedId] = useState<number | null>(null)

  const expandedId = externalExpandedId !== undefined ? externalExpandedId : internalExpandedId

  const handleExpandToggle = (id: number) => {
    const newId = expandedId === id ? null : id
    if (onExpandToggle) {
      onExpandToggle(newId)
    } else {
      setInternalExpandedId(newId)
    }
  }

  const getRagBadge = (rating: string) => {
    const badges = {
      green: 'bg-emerald-500 text-white shadow-sm min-w-[90px]',
      amber: 'bg-amber-500 text-white shadow-sm min-w-[90px]',
      red: 'bg-red-500 text-white shadow-sm min-w-[90px]',
      pending: 'bg-slate-300 text-slate-700 min-w-[90px]',
    }
    return badges[rating as keyof typeof badges] || badges.pending
  }

  const getRagLabel = (rating: string) => {
    return rating.charAt(0).toUpperCase() + rating.slice(1)
  }

  const getSatisfactionPercentage = (rating: string) => {
    const satisfactionMap = {
      green: 90,
      amber: 50,
      red: 10,
      pending: 0,
    }
    return satisfactionMap[rating as keyof typeof satisfactionMap] || 0
  }

  const getConfidenceLabel = (confidence: number | null) => {
    if (confidence === null) return 'Unknown'
    const confValue = confidence <= 1 ? confidence * 100 : confidence
    if (confValue >= 80) return 'High'
    if (confValue >= 50) return 'Medium'
    return 'Low'
  }

  const getConfidenceColor = (confidence: number | null) => {
    if (confidence === null) return 'bg-slate-200'
    return 'bg-blue-500'
  }

  return (
    <div className="space-y-3">
      {assessments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary">No assessments found.</p>
        </div>
      ) : (
        assessments.map((assessment) => (
          <div
            key={assessment.id}
            id={`assessment-${assessment.id}`}
            className={cn(
              'card transition-all',
              expandedId === assessment.id && 'ring-2 ring-secondary'
            )}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left side: Code, Title, Dimension */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded">
                    {assessment.assessment_criteria.criterion_code}
                  </span>
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-text-secondary">
                    {assessment.assessment_criteria.dimension}
                  </span>
                  {assessment.assessment_criteria.is_critical && (
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-rag-red/10 text-rag-red border border-rag-red/30">
                      CRITICAL
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  {assessment.assessment_criteria.title}
                </h3>
                {assessment.summary && (
                  <p className="text-sm text-text-secondary italic line-clamp-2">
                    {assessment.summary}
                  </p>
                )}
              </div>

              {/* Right side: Metrics and badges */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* RAG Badge */}
                <span
                  className={cn(
                    'px-4 py-2 rounded-lg font-bold text-base text-center inline-flex items-center justify-center',
                    getRagBadge(assessment.rag_rating)
                  )}
                >
                  {getRagLabel(assessment.rag_rating)}
                </span>

                {/* Confidence Bar */}
                <div className="w-24 hidden md:block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">Confidence</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {getConfidenceLabel(assessment.confidence)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        getConfidenceColor(assessment.confidence)
                      )}
                      style={{
                        width: `${assessment.confidence !== null
                          ? assessment.confidence <= 1
                            ? assessment.confidence * 100
                            : assessment.confidence
                          : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => handleExpandToggle(assessment.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={expandedId === assessment.id ? 'Collapse' : 'Expand'}
                >
                  {expandedId === assessment.id ? (
                    <ChevronUp size={24} className="text-secondary" />
                  ) : (
                    <ChevronDown size={24} className="text-text-secondary" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === assessment.id && (
              <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Metadata Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-slate-200">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Satisfaction</div>
                    <div className="text-lg font-bold text-slate-900">
                      {assessment.satisfaction_score !== null
                        ? `${assessment.satisfaction_score}%`
                        : `${getSatisfactionPercentage(assessment.rag_rating)}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Confidence</div>
                    <div className="text-lg font-bold text-slate-900">
                      {getConfidenceLabel(assessment.confidence)}
                    </div>
                  </div>
                  {assessment.assessment_criteria.weight !== null && (
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Weight</div>
                      <div className="text-lg font-bold text-slate-900">
                        {assessment.assessment_criteria.weight}%
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Critical</div>
                    <div className="text-lg font-bold text-slate-900">
                      {assessment.assessment_criteria.is_critical ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Finding */}
                {assessment.finding && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Finding
                      </h4>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {assessment.finding}
                    </p>
                  </div>
                )}

                {/* Evidence */}
                {assessment.evidence && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Evidence
                      </h4>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {assessment.evidence}
                    </p>
                  </div>
                )}

                {/* Recommendation */}
                {assessment.recommendation && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Recommendation
                      </h4>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {assessment.recommendation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
