import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'

interface Assessment {
  id: number
  ragRating: 'green' | 'amber' | 'red' | 'pending'
  finding: string | null
  evidence: string | null
  recommendation: string | null
  confidence: number | null
  assessment_criteria: {
    criterionCode: string
    title: string
    dimension: string
  }
}

interface AssessmentResultsProps {
  assessments: Assessment[]
}

export default function AssessmentResults({
  assessments,
}: AssessmentResultsProps) {
  const [filter, setFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

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

  const filteredAssessments =
    filter === 'all'
      ? assessments
      : assessments.filter((a) => a.ragRating === filter)

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            filter === 'all'
              ? 'bg-secondary text-white'
              : 'bg-card border-2 border-border text-text-primary hover:border-secondary/30'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('green')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            filter === 'green'
              ? 'bg-rag-green text-white'
              : 'bg-card border-2 border-border text-text-primary hover:border-rag-green/30'
          )}
        >
          Green
        </button>
        <button
          onClick={() => setFilter('amber')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            filter === 'amber'
              ? 'bg-rag-amber text-white'
              : 'bg-card border-2 border-border text-text-primary hover:border-rag-amber/30'
          )}
        >
          Amber
        </button>
        <button
          onClick={() => setFilter('red')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            filter === 'red'
              ? 'bg-rag-red text-white'
              : 'bg-card border-2 border-border text-text-primary hover:border-rag-red/30'
          )}
        >
          Red
        </button>
      </div>

      {/* Results Table */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">
              No assessments found for the selected filter.
            </p>
          </div>
        ) : (
          filteredAssessments.map((assessment) => (
            <div key={assessment.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-text-secondary">
                      {assessment.assessment_criteria.criterionCode}
                    </span>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {assessment.assessment_criteria.title}
                    </h3>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {assessment.assessment_criteria.dimension}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* RAG Rating */}
                  <span
                    className={cn(
                      'px-3 py-1 rounded-lg font-semibold text-sm',
                      getRagBadge(assessment.ragRating)
                    )}
                  >
                    {getRagLabel(assessment.ragRating)}
                  </span>

                  {/* Confidence Score */}
                  {assessment.confidence !== null && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all"
                          style={{ width: `${assessment.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">
                        {assessment.confidence}%
                      </span>
                    </div>
                  )}

                  {/* Expand Button */}
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === assessment.id ? null : assessment.id
                      )
                    }
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {expandedId === assessment.id ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === assessment.id && (
                <div className="mt-6 space-y-4 pt-4 border-t border-border">
                  {assessment.finding && (
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">
                        Finding
                      </h4>
                      <p className="text-text-secondary bg-gray-50 p-4 rounded-lg">
                        {assessment.finding}
                      </p>
                    </div>
                  )}

                  {assessment.evidence && (
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">
                        Evidence
                      </h4>
                      <p className="text-text-secondary bg-blue-50 p-4 rounded-lg italic border-l-4 border-secondary">
                        {assessment.evidence}
                      </p>
                    </div>
                  )}

                  {assessment.recommendation && (
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">
                        Recommendation
                      </h4>
                      <p className="text-text-secondary bg-green-50 p-4 rounded-lg">
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
    </div>
  )
}
