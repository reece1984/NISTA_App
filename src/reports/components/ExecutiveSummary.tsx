import RatingBadge from './RatingBadge'

interface ExecutiveSummaryProps {
  assessment: any
  criticalIssues: any[]
  recommendations: any[]
}

export default function ExecutiveSummary({ assessment, criticalIssues, recommendations }: ExecutiveSummaryProps) {
  const getRatingTitle = (rating: string) => {
    switch (rating) {
      case 'GREEN':
        return 'Strong Performance'
      case 'AMBER':
        return 'Acceptable with Conditions'
      case 'RED':
        return 'Significant Concerns'
      default:
        return rating
    }
  }

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-green-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="report-section">
      <h2 className="section-title">Executive Summary</h2>

      {/* Assessment overview */}
      <div className="summary-card">
        <div className="summary-header">
          <div className="summary-rating">
            <RatingBadge rating={assessment.overall_rating} size="large" />
          </div>
          <div className="summary-text">
            <h3>Assessment Outcome: {getRatingTitle(assessment.overall_rating)}</h3>
            <p>{assessment.executive_summary || 'Overall assessment of gateway readiness based on criteria evaluation.'}</p>
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-value">{assessment.readiness_score}%</span>
          <span className="metric-label">Overall Readiness</span>
          <div className="metric-bar">
            <div
              className={`metric-bar-fill ${getBarColor(assessment.readiness_score)}`}
              style={{ width: `${assessment.readiness_score}%` }}
            />
          </div>
        </div>
        <div className="metric-card">
          <span className="metric-value green">{assessment.green_count}</span>
          <span className="metric-label">Criteria at GREEN</span>
        </div>
        <div className="metric-card">
          <span className="metric-value amber">{assessment.amber_count}</span>
          <span className="metric-label">Criteria at AMBER</span>
        </div>
        <div className="metric-card">
          <span className="metric-value red">{assessment.red_count}</span>
          <span className="metric-label">Criteria at RED</span>
        </div>
      </div>

      {/* Assessment by case summary */}
      <h3 className="subsection-title">Assessment by Case</h3>
      <table className="case-summary-table">
        <thead>
          <tr>
            <th>Case</th>
            <th>Rating</th>
            <th>Criteria</th>
            <th>Critical Issues</th>
            <th>Key Finding</th>
          </tr>
        </thead>
        <tbody>
          {assessment.case_summaries?.map((caseSummary: any) => (
            <tr key={caseSummary.case}>
              <td className="case-name">
                <span className={`case-indicator ${caseSummary.case.toLowerCase()}`} />
                {caseSummary.case}
              </td>
              <td><RatingBadge rating={caseSummary.rating} size="small" /></td>
              <td>{caseSummary.criteria_count}</td>
              <td className={caseSummary.critical_count > 0 ? 'text-red' : ''}>
                {caseSummary.critical_count}
              </td>
              <td className="key-finding">{caseSummary.key_finding}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Critical issues */}
      <h3 className="subsection-title">Critical Issues Requiring Resolution</h3>
      <p className="subsection-intro">
        The following {criticalIssues.length} issue{criticalIssues.length !== 1 ? 's' : ''} must be addressed before the Gateway Review:
      </p>
      <div className="critical-issues-list">
        {criticalIssues.slice(0, 8).map((issue, index) => (
          <div key={issue.id} className="critical-issue">
            <span className="issue-number">{index + 1}</span>
            <div className="issue-content">
              <p className="issue-title">{issue.criterion_name}</p>
              <p className="issue-description">{issue.finding}</p>
              <p className="issue-case">{issue.case} Case · {issue.criterion_code}</p>
            </div>
            <RatingBadge rating="RED" size="small" />
          </div>
        ))}
      </div>

      {/* Top recommendations */}
      <h3 className="subsection-title">Priority Recommendations</h3>
      <div className="recommendations-list">
        {recommendations.slice(0, 5).map((rec, index) => (
          <div key={rec.id} className="recommendation">
            <span className="rec-number">{index + 1}</span>
            <div className="rec-content">
              <p className="rec-text">{rec.recommendation}</p>
              <div className="rec-meta">
                <span className={`priority-badge priority-${rec.priority.toLowerCase()}`}>
                  {rec.priority}
                </span>
                <span className="rec-impact">+{rec.impact}% potential improvement</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
