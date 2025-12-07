import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight, FileText, Clock, DollarSign, Truck,
  X, AlertCircle, CheckCircle, AlertTriangle,
  BarChart3, Download, RefreshCw, ExternalLink,
  FileStack, Edit3
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ProjectOverviewProps {
  project: any
  assessmentResults: any[]
  latestAssessment: any
}

export default function ProjectOverview({ project, assessmentResults, latestAssessment }: ProjectOverviewProps) {
  // Calculate overall rating
  const getOverallRating = () => {
    if (!assessmentResults || assessmentResults.length === 0) return 'PENDING'

    const redCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'red').length
    const amberCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'amber').length

    if (redCount > 0) return 'RED'
    if (amberCount > 3) return 'AMBER'
    return 'GREEN'
  }

  const overallRating = getOverallRating()
  const ratingColor = overallRating === 'RED' ? '#dc2626' :
                      overallRating === 'AMBER' ? '#d97706' :
                      overallRating === 'GREEN' ? '#059669' : 'var(--text-muted)'

  // Group results by dimension for breakdown chart
  const dimensionBreakdown = () => {
    const dimensions = ['Strategic', 'Economic', 'Commercial', 'Financial', 'Management']
    return dimensions.map(dimension => {
      // Match dimension from assessment_criteria.category field which contains values like "Strategic Case"
      const dimResults = assessmentResults.filter(r => {
        // Check both the assessment criteria category and any direct category field
        const category = r.assessment_criteria?.category || r.category || r.dimension || ''
        return category.toLowerCase().includes(dimension.toLowerCase())
      })
      const green = dimResults.filter(r => r.rag_rating?.toLowerCase() === 'green').length
      const amber = dimResults.filter(r => r.rag_rating?.toLowerCase() === 'amber').length
      const red = dimResults.filter(r => r.rag_rating?.toLowerCase() === 'red').length
      const total = green + amber + red

      return { dimension, green, amber, red, total }
    })
  }

  const breakdown = dimensionBreakdown()

  // Get critical findings (Red and critical Amber)
  const criticalFindings = assessmentResults.filter(r =>
    r.rag_rating?.toLowerCase() === 'red' || (r.rag_rating?.toLowerCase() === 'amber' && (r.assessment_criteria?.is_gateway_blocker || r.assessment_criteria?.is_critical))
  ).slice(0, 4)

  // Count ratings
  const greenCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'green').length
  const amberCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'amber').length
  const redCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'red').length

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Format value
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}B`
    }
    return `£${value}M`
  }

  return (
    <div style={{ padding: '2rem' }}>

      {/* Rating Hero Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Rating Card */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)'
            }}>
              Gateway Readiness
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              v{latestAssessment?.id || 1} • {latestAssessment ? formatDate(latestAssessment.created_at) : 'Today'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: ratingColor
            }}>
              {overallRating === 'RED' ? (
                <X size={32} color="white" strokeWidth={2.5} />
              ) : overallRating === 'AMBER' ? (
                <AlertTriangle size={32} color="white" strokeWidth={2.5} />
              ) : overallRating === 'GREEN' ? (
                <CheckCircle size={32} color="white" strokeWidth={2.5} />
              ) : (
                <AlertCircle size={32} color="white" strokeWidth={2.5} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '0.25rem',
                color: ratingColor
              }}>
                {overallRating}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
              }}>
                {overallRating === 'RED' ? 'Significant issues to address' :
                 overallRating === 'AMBER' ? 'Some concerns need attention' :
                 overallRating === 'GREEN' ? 'Project is on track' :
                 'Assessment pending'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--green)'
              }}>
                {greenCount}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Green
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--amber)'
              }}>
                {amberCount}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Amber
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--red)'
              }}>
                {redCount}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Red
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Breakdown Card */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ink)'
            }}>
              Assessment by Dimension
            </h3>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: 'var(--green)'
                }} />
                Green
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: 'var(--amber)'
                }} />
                Amber
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: 'var(--red)'
                }} />
                Red
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {breakdown.map(({ dimension, green, amber, red, total }) => {
              const greenWidth = total > 0 ? (green / total) * 100 : 0
              const amberWidth = total > 0 ? (amber / total) * 100 : 0
              const redWidth = total > 0 ? (red / total) * 100 : 0

              return (
                <div key={dimension} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{
                    width: '90px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'var(--ink-subtle)'
                  }}>
                    {dimension}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '28px',
                    background: 'var(--gray-100)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex'
                  }}>
                    {green > 0 && (
                      <div style={{
                        width: `${greenWidth}%`,
                        height: '100%',
                        background: 'var(--green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'white',
                        minWidth: '24px'
                      }}>
                        {green}
                      </div>
                    )}
                    {amber > 0 && (
                      <div style={{
                        width: `${amberWidth}%`,
                        height: '100%',
                        background: 'var(--amber)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'white',
                        minWidth: '24px'
                      }}>
                        {amber}
                      </div>
                    )}
                    {red > 0 && (
                      <div style={{
                        width: `${redWidth}%`,
                        height: '100%',
                        background: 'var(--red)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'white',
                        minWidth: '24px'
                      }}>
                        {red}
                      </div>
                    )}
                    {total === 0 && (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)'
                      }}>
                        No data
                      </div>
                    )}
                  </div>
                  <span style={{
                    width: '30px',
                    textAlign: 'right',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)'
                  }}>
                    {total}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Priority Issues Section */}
      {assessmentResults.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Priority Issues
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                background: 'var(--red)',
                color: 'white',
                borderRadius: '50%',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {criticalFindings.length}
              </span>
            </h2>
            <a href="#" style={{
              fontSize: '0.85rem',
              color: 'var(--ink)',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              View all findings
              <ChevronRight size={14} />
            </a>
          </div>

          {criticalFindings.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              {criticalFindings.map((finding) => (
              <div
                key={finding.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${finding.rag_rating?.toLowerCase() === 'red' ? 'var(--red)' : 'var(--amber)'}`,
                  borderRadius: '8px',
                  padding: '1.35rem 1.5rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = finding.rag_rating?.toLowerCase() === 'red' ? 'var(--red-border)' : 'var(--amber-border)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.borderLeftColor = finding.rag_rating?.toLowerCase() === 'red' ? 'var(--red)' : 'var(--amber)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--ink)'
                  }}>
                    {finding.assessment_criteria?.criterion_code || finding.criterion_code || 'N/A'}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    background: finding.rag_rating?.toLowerCase() === 'red' ? 'var(--red-bg)' : 'var(--amber-bg)',
                    color: finding.rag_rating?.toLowerCase() === 'red' ? 'var(--red)' : 'var(--amber)'
                  }}>
                    {finding.rag_rating?.toUpperCase() || 'AMBER'}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.4
                }}>
                  {finding.assessment_criteria?.title || finding.title || 'Assessment Finding'}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5
                }}>
                  {(finding.finding || finding.finding_text || finding.recommendation || 'Review required')?.substring(0, 150)}...
                </div>
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  background: 'var(--gray-100)',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)'
                }}>
                  {finding.assessment_criteria?.category || finding.category || 'General'}
                </span>
              </div>
            ))}
            </div>
          ) : (
            <div style={{
              background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              borderRadius: '10px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <CheckCircle size={24} style={{ color: 'var(--green)', marginBottom: '0.5rem' }} />
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '0.25rem'
              }}>
                No Critical Issues Found
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
              }}>
                All assessed criteria are meeting expectations
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Details Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '1rem'
        }}>
          Project Details
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem'
        }}>
          {/* Documents Card */}
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.875rem'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gray-100)',
                borderRadius: '6px',
                color: 'var(--ink)'
              }}>
                <FileText size={14} />
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Documents
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '0.25rem'
            }}>
              {project.documents?.length || 0} document{project.documents?.length !== 1 ? 's' : ''} uploaded
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem'
            }}>
              {project.documents && project.documents.length > 0
                ? project.documents[0].name || project.documents[0].file_name || 'Document uploaded'
                : 'No documents yet'}
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // Navigate to documents tab
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                color: 'var(--ink)',
                textDecoration: 'none',
                fontWeight: 500
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--copper)'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--ink)'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              Manage documents
              <ChevronRight size={12} />
            </a>
          </div>

          {/* Assessment Template Card */}
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.875rem'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gray-100)',
                borderRadius: '6px',
                color: 'var(--ink)'
              }}>
                <Edit3 size={14} />
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Assessment Template
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '0.25rem'
            }}>
              {project.template_name || 'Gate 0'}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              {assessmentResults.length} criteria • {assessmentResults.filter(r => r.is_critical).length} critical
            </div>
            <Link to="/criteria" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.75rem',
              fontSize: '0.8rem',
              color: 'var(--ink)',
              textDecoration: 'none',
              fontWeight: 500
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--copper)'
              e.currentTarget.style.textDecoration = 'underline'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--ink)'
              e.currentTarget.style.textDecoration = 'none'
            }}
            >
              View template criteria
              <ChevronRight size={12} />
            </Link>
          </div>

          {/* Assessment History Card */}
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.875rem'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gray-100)',
                borderRadius: '6px',
                color: 'var(--ink)'
              }}>
                <Clock size={14} />
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Assessment History
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '0.25rem'
            }}>
              Version {latestAssessment?.id || 1}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem'
            }}>
              Last run: {latestAssessment ? formatDate(latestAssessment.created_at) + ', 14:32' : 'Not yet'}
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // Navigate to history
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                color: 'var(--ink)',
                textDecoration: 'none',
                fontWeight: 500
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--copper)'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--ink)'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              View history
              <ChevronRight size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        padding: '1.5rem',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          background: 'var(--ink)',
          color: 'white',
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
          <BarChart3 size={16} />
          View Full Assessment
        </button>
        <button style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          color: 'var(--ink)',
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
          Export Report
        </button>
        <button style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          color: 'var(--ink)',
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
          <RefreshCw size={16} />
          Re-run Assessment
        </button>
      </div>
    </div>
  )
}