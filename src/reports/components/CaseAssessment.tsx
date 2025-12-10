import RatingBadge from './RatingBadge'

interface CaseAssessmentProps {
  caseName: string
  caseData: any
}

export default function CaseAssessment({ caseName, caseData }: CaseAssessmentProps) {
  const truncate = (text: string, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="case-section">
      {/* Case header */}
      <div className="case-header">
        <div className="case-title-row">
          <span className={`case-indicator-large ${caseName.toLowerCase()}`} />
          <h2 className="case-title">{caseName} Case</h2>
          <RatingBadge rating={caseData.rating} size="medium" />
        </div>
        <p className="case-summary">{caseData.summary}</p>
      </div>

      {/* Case stats */}
      <div className="case-stats">
        <div className="case-stat">
          <span className="case-stat-value">{caseData.criteria_count}</span>
          <span className="case-stat-label">Criteria</span>
        </div>
        <div className="case-stat">
          <span className="case-stat-value green">{caseData.green_count}</span>
          <span className="case-stat-label">GREEN</span>
        </div>
        <div className="case-stat">
          <span className="case-stat-value amber">{caseData.amber_count}</span>
          <span className="case-stat-label">AMBER</span>
        </div>
        <div className="case-stat">
          <span className="case-stat-value red">{caseData.red_count}</span>
          <span className="case-stat-label">RED</span>
        </div>
      </div>

      {/* Criteria table */}
      <table className="criteria-table">
        <thead>
          <tr>
            <th className="col-code">Code</th>
            <th className="col-criterion">Criterion</th>
            <th className="col-rating">Rating</th>
            <th className="col-confidence">Conf.</th>
            <th className="col-finding">Finding</th>
          </tr>
        </thead>
        <tbody>
          {caseData.criteria.map((criterion: any) => (
            <tr key={criterion.id} className={criterion.is_critical ? 'critical-row' : ''}>
              <td className="criterion-code">
                {criterion.code}
                {criterion.is_critical && <span className="critical-marker">!</span>}
              </td>
              <td className="criterion-name">{criterion.name}</td>
              <td><RatingBadge rating={criterion.rating} size="small" /></td>
              <td className="confidence">{criterion.confidence}%</td>
              <td className="finding-text">{truncate(criterion.finding, 150)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Evidence gaps for this case */}
      {caseData.evidence_gaps && caseData.evidence_gaps.length > 0 && (
        <div className="evidence-gaps">
          <h4 className="gaps-title">Evidence Gaps</h4>
          <ul className="gaps-list">
            {caseData.evidence_gaps.map((gap: string, index: number) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations for this case */}
      {caseData.recommendations && caseData.recommendations.length > 0 && (
        <div className="case-recommendations">
          <h4 className="recs-title">Recommendations</h4>
          {caseData.recommendations.map((rec: string, index: number) => (
            <div key={index} className="case-rec">
              <span className="case-rec-number">{index + 1}.</span>
              <span className="case-rec-text">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
