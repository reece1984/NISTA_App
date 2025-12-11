import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import RatingBadge from './RatingBadge'

interface CaseSummary {
  case: string
  rating: 'RED' | 'AMBER' | 'GREEN'
  criteriaCount: number
  criticalCount: number
  keyFinding: string
}

interface AssessmentByCaseProps {
  caseSummaries: CaseSummary[]
  onCaseClick?: (caseName: string) => void
}

const CASE_COLORS: Record<string, string> = {
  'Strategic': '#3b82f6',    // blue-500
  'Economic': '#10b981',     // emerald-500
  'Commercial': '#8b5cf6',   // purple-500
  'Financial': '#f59e0b',    // amber-500
  'Management': '#64748b'    // slate-500
}

export default function AssessmentByCase({ caseSummaries, onCaseClick }: AssessmentByCaseProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="assessment-by-case">
      {/* Section Header */}
      <div
        className="section-header-collapsible"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer' }}
      >
        <div className="section-header-left">
          {isCollapsed ? (
            <ChevronRight className="section-chevron" size={20} />
          ) : (
            <ChevronDown className="section-chevron" size={20} />
          )}
          <div>
            <h3 className="section-title">Assessment by Case</h3>
            <p className="section-description">
              Readiness breakdown across the Five Case Model
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="assessment-by-case-content">
          {/* Desktop/Tablet: Table */}
          <table className="case-summary-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Rating</th>
                <th>Criteria</th>
                <th>Focus Areas</th>
                <th>Key Finding</th>
              </tr>
            </thead>
            <tbody>
              {caseSummaries.map((summary) => (
                <tr
                  key={summary.case}
                  className="case-row hover:bg-slate-50 transition-colors"
                  onClick={() => onCaseClick?.(summary.case)}
                  style={{
                    cursor: onCaseClick ? 'pointer' : 'default',
                    borderLeft: `4px solid ${CASE_COLORS[summary.case] || '#64748b'}`
                  }}
                >
                  <td className="case-name-cell">
                    {summary.case}
                  </td>
                  <td>
                    <RatingBadge rating={summary.rating} size="small" />
                  </td>
                  <td className="text-center">{summary.criteriaCount}</td>
                  <td className="text-center text-slate-700 font-medium">
                    {summary.criticalCount}
                  </td>
                  <td className="case-finding-cell">
                    <span className="line-clamp-2" title={summary.keyFinding}>
                      {summary.keyFinding}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: Cards */}
          <div className="case-summary-cards">
            {caseSummaries.map((summary) => (
              <div
                key={summary.case}
                className="case-summary-card"
                onClick={() => onCaseClick?.(summary.case)}
                style={{
                  borderLeft: `4px solid ${CASE_COLORS[summary.case] || '#64748b'}`,
                  cursor: onCaseClick ? 'pointer' : 'default'
                }}
              >
                <div className="case-card-header">
                  <span className="case-card-name">{summary.case}</span>
                  <RatingBadge rating={summary.rating} size="small" />
                </div>
                <div className="case-card-stats">
                  <div className="case-card-stat">
                    <span className="stat-value">{summary.criteriaCount}</span>
                    <span className="stat-label">Criteria</span>
                  </div>
                  <div className="case-card-stat">
                    <span className="stat-value text-slate-700">
                      {summary.criticalCount}
                    </span>
                    <span className="stat-label">Focus Areas</span>
                  </div>
                </div>
                <p className="case-card-finding">{summary.keyFinding}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
