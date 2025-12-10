import RatingBadge from './RatingBadge'

interface CoverPageProps {
  project: any
  assessment: any
}

export default function CoverPage({ project, assessment }: CoverPageProps) {
  const formatDate = (date: string) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatValue = (value: number | null | undefined) => {
    if (!value || value === 0) return 'Not specified'
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const getRatingSubtitle = (rating: string) => {
    switch (rating?.toUpperCase()) {
      case 'RED':
        return 'Critical issues require resolution'
      case 'AMBER':
        return 'Issues exist but project can proceed with conditions'
      case 'GREEN':
        return 'Project ready to proceed'
      default:
        return ''
    }
  }

  const getGateName = (gate: number | string | null | undefined) => {
    if (!gate && gate !== 0) return 'Not specified'
    const gateNum = typeof gate === 'string' ? parseInt(gate) : gate
    const gates: Record<number, string> = {
      0: 'Strategic Assessment',
      1: 'Business Justification',
      2: 'Delivery Strategy',
      3: 'Investment Decision',
      4: 'Readiness for Service',
      5: 'Operations Review'
    }
    return gates[gateNum] || 'Gateway Review'
  }

  // Safely get gate number for display
  const getGateNumber = () => {
    const gate = project.current_gate || project.gate_number || project.template_id
    if (gate === null || gate === undefined) return ''
    return `Gate ${gate}`
  }

  return (
    <div className="cover-page">
      {/* Top section - subtle branding */}
      <div className="cover-header">
        <div className="brand">
          <span className="brand-gateway">Gateway</span>
          <span className="brand-success">Success</span>
        </div>
        <p className="brand-tagline">Gateway Intelligence Platform</p>
      </div>

      {/* Main content - centered */}
      <div className="cover-main">
        {/* Document type */}
        <p className="document-type">GATEWAY REVIEW ASSESSMENT</p>

        {/* Project name - large */}
        <h1 className="project-name">{project.name || project.project_name || 'Unnamed Project'}</h1>

        {/* Gate badge */}
        <div className="gate-badge">
          {getGateNumber()}: {getGateName(project.current_gate || project.gate_number || project.template_id)}
        </div>

        {/* Readiness hero - constructive visual instead of alarming RED box */}
        <div className="readiness-hero">
          {/* Left: Donut chart */}
          <div className="readiness-donut">
            <svg viewBox="0 0 120 120" className="donut-svg">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              {/* Progress arc */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={assessment.readiness_score < 50 ? '#dc2626' :
                        assessment.readiness_score < 85 ? '#f59e0b' : '#16a34a'}
                strokeWidth="12"
                strokeDasharray={`${assessment.readiness_score * 3.14} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="donut-center">
              <span className="donut-value">{assessment.readiness_score}%</span>
              <span className="donut-label">Ready</span>
            </div>
          </div>

          {/* Right: Status info */}
          <div className="readiness-info">
            <div className="readiness-header">
              <h2 className="readiness-title">Gateway Readiness</h2>
              <span className={`predicted-badge predicted-${assessment.overall_rating.toLowerCase()}`}>
                Predicted: {assessment.overall_rating}
              </span>
            </div>

            <p className="readiness-description">
              {assessment.readiness_score < 50
                ? 'Significant work required to achieve gateway readiness'
                : assessment.readiness_score < 85
                ? 'Good progress, some areas need attention'
                : 'On track for successful gateway review'}
            </p>

            {/* Progress bar */}
            <div className="readiness-bar-container">
              <div className="readiness-bar">
                <div
                  className={`readiness-bar-fill ${assessment.readiness_score < 50 ? 'red' : assessment.readiness_score < 85 ? 'amber' : 'green'}`}
                  style={{ width: `${assessment.readiness_score}%` }}
                />
                <div className="readiness-bar-threshold" style={{ left: '85%' }}>
                  <span className="threshold-label">GREEN</span>
                </div>
              </div>
            </div>

            {/* Key stats */}
            <div className="readiness-stats">
              <div className="stat-item">
                <span className="stat-value">{assessment.criteria_assessed}</span>
                <span className="stat-label">Criteria Assessed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value stat-red">{assessment.critical_count}</span>
                <span className="stat-label">Critical Issues</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{project.days_to_gate || '—'}</span>
                <span className="stat-label">Days to Gate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - metadata */}
      <div className="cover-footer">
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Sponsoring Department</span>
            <span className="metadata-value">{project.sponsoring_organisation || 'Not specified'}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Delivery Organisation</span>
            <span className="metadata-value">{project.delivery_organisation || 'Not specified'}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Project Value</span>
            <span className="metadata-value">£{formatValue(project.value)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Sector</span>
            <span className="metadata-value">{project.sector || 'Not specified'}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Assessment Date</span>
            <span className="metadata-value">{formatDate(assessment.created_at)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Gateway Review Date</span>
            <span className="metadata-value">{project.gateway_review_date ? formatDate(project.gateway_review_date) : 'Not set'}</span>
          </div>
        </div>

        {/* Confidentiality notice */}
        <p className="confidentiality">
          OFFICIAL - SENSITIVE: This document contains assessment information for internal use only.
        </p>
      </div>
    </div>
  )
}
