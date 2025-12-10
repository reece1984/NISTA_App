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

        {/* Overall rating - prominent */}
        <div className={`overall-rating rating-${assessment.overall_rating.toLowerCase()}`}>
          <p className="rating-label">Predicted Gateway Outcome</p>
          <p className="rating-value">{assessment.overall_rating}</p>
          <p className="rating-subtitle">
            {getRatingSubtitle(assessment.overall_rating)}
          </p>
        </div>

        {/* Key stats row */}
        <div className="cover-stats">
          <div className="stat">
            <span className="stat-value">{assessment.criteria_assessed}</span>
            <span className="stat-label">Criteria Assessed</span>
          </div>
          <div className="stat">
            <span className="stat-value text-red">{assessment.critical_count}</span>
            <span className="stat-label">Critical Issues</span>
          </div>
          <div className="stat">
            <span className="stat-value">{assessment.readiness_score}%</span>
            <span className="stat-label">Readiness Score</span>
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
