import { CheckCircle, X, AlertCircle, RefreshCw, Download, FileText, Lightbulb, Plus } from 'lucide-react'
import { generateExecutiveSummary, generateRecommendations } from '../utils/assessmentUtils'

interface AssessmentSummaryProps {
  project: any
  assessmentResults: any[]
  onRerunAssessment: () => void
  onExportExcel: () => void
  onExportPDF: () => void
  onGenerateActionPlan: () => void
  runningAssessment: boolean
  onCreateAction?: (recommendation: any) => void
}

export default function AssessmentSummary({
  project,
  assessmentResults,
  onRerunAssessment,
  onExportExcel,
  onExportPDF,
  onGenerateActionPlan,
  runningAssessment,
  onCreateAction
}: AssessmentSummaryProps) {
  // Calculate overall rating
  const redCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'red').length
  const amberCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'amber').length
  const greenCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'green').length
  const criticalRed = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'red' && (r.assessment_criteria?.is_critical)).length

  const overallRating = criticalRed > 0 || redCount >= 3 ? 'RED' :
                        amberCount >= 5 ? 'AMBER' : 'GREEN'

  const ratingColor = overallRating === 'RED' ? 'var(--red)' :
                     overallRating === 'AMBER' ? 'var(--amber)' : 'var(--green)'

  const ratingBg = overallRating === 'RED' ? 'var(--red-bg)' :
                   overallRating === 'AMBER' ? 'var(--amber-bg)' : 'var(--green-bg)'

  const ratingText = overallRating === 'RED' ? 'Not Ready to Proceed' :
                     overallRating === 'AMBER' ? 'Proceed with Conditions' : 'Ready to Proceed'

  const ratingSubtext = overallRating === 'RED' ? 'Critical issues require resolution' :
                        overallRating === 'AMBER' ? 'Some concerns to address' : 'Project meets all criteria'

  // Get key strengths (GREEN ratings)
  const keyStrengths = assessmentResults
    .filter(r => r.rag_rating?.toLowerCase() === 'green')
    .slice(0, 6)
    .reduce((acc: any[], curr) => {
      const category = curr.assessment_criteria?.category || curr.category || 'General'
      const existing = acc.find(s => s.category === category)
      if (existing) {
        existing.criteria.push(curr)
      } else {
        acc.push({ category, criteria: [curr] })
      }
      return acc
    }, [])

  // Get critical issues (RED and critical AMBER)
  const criticalIssues = assessmentResults
    .filter(r => r.rag_rating?.toLowerCase() === 'red' || (r.rag_rating?.toLowerCase() === 'amber' && r.assessment_criteria?.is_critical))
    .sort((a, b) => {
      // Sort RED before AMBER, then by criticality
      const aRating = a.rag_rating?.toLowerCase()
      const bRating = b.rag_rating?.toLowerCase()
      if (aRating !== bRating) return aRating === 'red' ? -1 : 1
      return (b.assessment_criteria?.is_critical) ? 1 : -1
    })
    .slice(0, 8)

  // Generate executive summary and recommendations
  const executiveSummary = generateExecutiveSummary(assessmentResults, overallRating, project)
  const recommendations = generateRecommendations(criticalIssues)

  // Get latest assessment info
  const latestAssessment = project.assessments?.[0]
  const assessmentVersion = latestAssessment?.id || 1
  const assessmentDate = latestAssessment ? new Date(latestAssessment.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ', 14:32' : 'Not yet run'

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          .top-nav, .tab-nav, .doc-actions, .project-header > button {
            display: none !important;
          }
          .main-content {
            padding: 0 !important;
            max-width: none !important;
          }
          .summary-document {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Summary Document */}
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {/* Document Header */}
        <div style={{
          padding: '2rem 2.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '0.25rem'
            }}>
              Gateway Assessment Report
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-muted)'
            }}>
              Comprehensive analysis of {assessmentResults.length} criteria against IPA standards
            </p>
          </div>
          <div className="doc-actions" style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={onRerunAssessment}
              disabled={runningAssessment}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'var(--white)',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: runningAssessment ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: runningAssessment ? 0.5 : 1
              }}
              onMouseEnter={e => {
                if (!runningAssessment) {
                  e.currentTarget.style.background = 'var(--gray-100)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--white)'
              }}
            >
              <RefreshCw size={16} />
              Re-run
            </button>
            <button
              onClick={onExportExcel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'var(--white)',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--gray-100)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--white)'
              }}
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={onExportPDF}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--ink-light)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--ink)'
              }}
            >
              <FileText size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Executive Summary Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '2rem',
          padding: '2rem 2.5rem',
          background: 'var(--gray-50)',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center'
        }}>
          {/* Rating Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: ratingColor,
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--white)'
            }}>
              {overallRating}
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: '0.25rem'
              }}>
                {ratingText}
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
              }}>
                {ratingSubtext}
              </p>
            </div>
          </div>

          {/* Executive Summary Text */}
          <div style={{
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: 'var(--text-body)',
            borderLeft: '3px solid var(--ink)',
            paddingLeft: '1.25rem'
          }}
          dangerouslySetInnerHTML={{ __html: executiveSummary }}
          />

          {/* Stats */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            paddingLeft: '2rem',
            borderLeft: '1px solid var(--border)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1
              }}>
                {assessmentResults.length}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginTop: '0.25rem'
              }}>
                Assessed
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--red)',
                lineHeight: 1
              }}>
                {criticalRed}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginTop: '0.25rem'
              }}>
                Critical
              </div>
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div style={{ padding: '2rem 2.5rem' }}>
          {/* Key Strengths Section */}
          {greenCount > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid var(--ink)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--green)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--white)'
                }}>
                  <CheckCircle size={16} strokeWidth={2.5} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--ink)'
                }}>
                  Key Strengths
                </h3>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500
                }}>
                  {greenCount} criteria rated GREEN
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {keyStrengths.map((strength, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1rem 1.25rem',
                      background: 'var(--green-bg)',
                      border: '1px solid var(--green-border)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: 'var(--green)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      <CheckCircle size={12} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        marginBottom: '0.25rem'
                      }}>
                        {strength.category.replace(' Case', '')}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5
                      }}>
                        {strength.criteria.length} criteria meeting expectations
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--green)',
                        fontWeight: 600,
                        marginTop: '0.35rem'
                      }}>
                        Criteria {strength.criteria.map(c => c.assessment_criteria?.criterion_code || c.criterion_code).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Issues Section */}
          {criticalIssues.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid var(--ink)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--red)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--white)'
                }}>
                  <X size={16} strokeWidth={2} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--ink)'
                }}>
                  Critical Issues
                </h3>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500
                }}>
                  {redCount} criteria rated RED
                </span>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {criticalIssues.map((issue) => (
                  <div
                    key={issue.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr',
                      gap: '1rem',
                      padding: '1.25rem',
                      background: issue.rag_rating?.toLowerCase() === 'red' ? 'var(--red-bg)' : 'var(--amber-bg)',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${issue.rag_rating?.toLowerCase() === 'red' ? 'var(--red)' : 'var(--amber)'}`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-body)'
                      }}>
                        {issue.assessment_criteria?.criterion_code || issue.criterion_code || 'N/A'}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        {(issue.assessment_criteria?.category || issue.category || 'General').replace(' Case', '')}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        width: 'fit-content',
                        background: issue.rag_rating?.toLowerCase() === 'red' ? 'var(--red)' : 'var(--amber)',
                        color: 'white'
                      }}>
                        {(issue.rag_rating || 'UNRATED').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '0.5rem'
                      }}>
                        <h4 style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: 'var(--ink)',
                          flex: 1
                        }}>
                          {issue.assessment_criteria?.title || issue.title || 'Assessment Finding'}
                        </h4>
                        {onCreateAction && (
                          <button
                            onClick={() => onCreateAction(issue)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.35rem 0.75rem',
                              background: '#c2703e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'background 0.2s ease',
                              flexShrink: 0
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#a85d32'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#c2703e'
                            }}
                          >
                            <Plus size={12} />
                            Create Action
                          </button>
                        )}
                      </div>
                      <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-body)',
                        lineHeight: 1.6
                      }}>
                        {issue.finding || issue.description || 'Finding details not available.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid var(--ink)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--ink)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--white)'
                }}>
                  <Lightbulb size={16} strokeWidth={2} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--ink)'
                }}>
                  Recommendations
                </h3>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500
                }}>
                  {overallRating === 'RED' ? 'Do not proceed until addressed' :
                   overallRating === 'AMBER' ? 'Address before next gate' :
                   'Continue with monitoring'}
                </span>
              </div>

              <div>
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1.25rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                      marginBottom: idx < recommendations.length - 1 ? '1rem' : 0
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'var(--ink)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '0.95rem',
                        color: 'var(--text-body)',
                        lineHeight: 1.7
                      }}
                      dangerouslySetInnerHTML={{ __html: rec.text }}
                      />
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '0.75rem'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          background: rec.priority === 'critical' ? 'var(--red-bg)' :
                                     rec.priority === 'high' ? 'var(--amber-bg)' : 'var(--gray-100)',
                          color: rec.priority === 'critical' ? 'var(--red)' :
                                 rec.priority === 'high' ? 'var(--amber)' : 'var(--text-muted)'
                        }}>
                          {rec.priority === 'critical' ? 'Critical Priority' :
                           rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                        </span>
                        {onCreateAction && (
                          <button
                            onClick={() => onCreateAction(rec)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.35rem 0.75rem',
                              background: '#c2703e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#a85d32'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#c2703e'
                            }}
                          >
                            <Plus size={12} />
                            Create Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Document Footer */}
        <div style={{
          padding: '1.5rem 2.5rem',
          background: 'var(--gray-50)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ marginRight: '1.5rem' }}>Version {assessmentVersion}</span>
            <span style={{ marginRight: '1.5rem' }}>Generated: {assessmentDate}</span>
            <span>Assessment ID: {project.name?.substring(0, 10).toUpperCase()}-{project.template_name?.replace('Gate ', 'G')}-{new Date().getFullYear()}-{String(assessmentVersion).padStart(3, '0')}</span>
          </div>
          <button
            onClick={onGenerateActionPlan}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--white)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gray-100)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--white)'
            }}
          >
            <FileText size={16} />
            Generate Action Plan
          </button>
        </div>
      </div>
    </>
  )
}