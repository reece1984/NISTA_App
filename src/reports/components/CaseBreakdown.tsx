interface CaseBreakdownProps {
  caseSummaries: Array<{
    case: string
    rating: 'RED' | 'AMBER' | 'GREEN'
    criteria_count: number
    critical_count: number
    key_finding: string
  }>
  assessmentsByCase: Record<string, any[]>
}

const CASE_ORDER = ['Strategic', 'Economic', 'Commercial', 'Financial', 'Management']

const getRatingColor = (rating: string) => {
  switch (rating.toUpperCase()) {
    case 'RED': return '#dc2626'
    case 'AMBER': return '#f59e0b'
    case 'GREEN': return '#16a34a'
    default: return '#64748b'
  }
}

const truncate = (text: string, max: number = 120) => {
  if (!text || text.length <= max) return text
  return text.substring(0, max).trim() + '...'
}

export default function CaseBreakdown({ caseSummaries, assessmentsByCase }: CaseBreakdownProps) {
  // Sort case summaries in Five Case Model order
  const sortedCases = CASE_ORDER.map(caseName =>
    caseSummaries.find(c => c.case === caseName)
  ).filter(Boolean)

  return (
    <div className="case-breakdown page-break">
      <h2 className="case-breakdown-title">Assessment by Case</h2>
      <p className="case-breakdown-subtitle">
        Readiness breakdown across the Five Case Model
      </p>

      <div className="case-grid">
        {sortedCases.map((caseData, index) => {
          if (!caseData) return null

          const caseName = caseData.case
          const caseAssessments = assessmentsByCase[caseName] || []

          // Calculate RAG breakdown
          const greenCount = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'GREEN').length
          const amberCount = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'AMBER').length
          const redCount = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length
          const total = caseAssessments.length

          const greenPercent = total > 0 ? (greenCount / total) * 100 : 0
          const amberPercent = total > 0 ? (amberCount / total) * 100 : 0
          const redPercent = total > 0 ? (redCount / total) * 100 : 0

          // Calculate readiness percentage
          const readinessPercent = total > 0
            ? Math.round(((greenCount * 100) + (amberCount * 50)) / total)
            : 0

          // Gateway blocker count (assuming RED with is_gateway_blocker flag)
          const blockerCount = caseAssessments.filter(
            a => a.rag_rating?.toUpperCase() === 'RED' && a.assessment_criteria?.is_gateway_blocker
          ).length

          return (
            <div
              key={caseName}
              className={`case-card ${index === sortedCases.length - 1 && sortedCases.length === 5 ? 'case-card-full' : ''}`}
            >
              {/* Case header with color indicator */}
              <div className="case-header">
                <span className={`case-indicator case-${caseName.toLowerCase()}`} />
                <h3 className="case-name">{caseName} Case</h3>
                <span className={`rating-badge rating-badge-${caseData.rating.toLowerCase()}`}>
                  {caseData.rating}
                </span>
              </div>

              {/* Mini donut showing case readiness */}
              <div className="case-visual">
                <div className="mini-donut">
                  <svg viewBox="0 0 80 80">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={getRatingColor(caseData.rating)}
                      strokeWidth="8"
                      strokeDasharray={`${readinessPercent * 2.01} 201`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <div className="mini-donut-center">
                    <span className="mini-donut-value">{readinessPercent}%</span>
                  </div>
                </div>

                {/* RAG breakdown bar */}
                <div className="case-rag">
                  <div className="rag-bar">
                    {greenPercent > 0 && (
                      <div className="rag-segment rag-green" style={{ width: `${greenPercent}%` }} />
                    )}
                    {amberPercent > 0 && (
                      <div className="rag-segment rag-amber" style={{ width: `${amberPercent}%` }} />
                    )}
                    {redPercent > 0 && (
                      <div className="rag-segment rag-red" style={{ width: `${redPercent}%` }} />
                    )}
                  </div>
                  <div className="rag-labels">
                    <span className="rag-label rag-label-green">{greenCount} GREEN</span>
                    <span className="rag-label rag-label-amber">{amberCount} AMBER</span>
                    <span className="rag-label rag-label-red">{redCount} RED</span>
                  </div>
                </div>
              </div>

              {/* Key stats */}
              <div className="case-stats">
                <div className="case-stat">
                  <span className="case-stat-value">{caseData.criteria_count}</span>
                  <span className="case-stat-label">Criteria</span>
                </div>
                <div className="case-stat">
                  <span className="case-stat-value case-stat-red">{caseData.critical_count}</span>
                  <span className="case-stat-label">Critical</span>
                </div>
                <div className="case-stat">
                  <span className="case-stat-value">{blockerCount}</span>
                  <span className="case-stat-label">Blockers</span>
                </div>
              </div>

              {/* Key finding summary */}
              <p className="case-finding">
                {truncate(caseData.key_finding, 120)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
