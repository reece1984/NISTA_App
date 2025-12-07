import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Upload, RefreshCw, FileText, ChevronRight, HelpCircle, DollarSign, Truck, File, Clock, FolderOpen, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import CreateProjectModal from '../components/CreateProjectModal'

interface ProjectData {
  id: string
  name: string
  gate: string
  gateTitle: string
  value: string
  sector: string
  documentCount: number
  hasAssessment: boolean
  currentRating: 'GREEN' | 'AMBER' | 'RED' | null
  lastAssessedDate: Date | null
  assessmentVersion: number | null
  criteriaCount: number | null
  greenCount: number | null
  amberCount: number | null
  redCount: number | null
}

export default function ProjectsLanding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [firstName, setFirstName] = useState('User')

  // Fetch user's first name
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      // Try to get user's name from their email if profile fetch fails
      if (user.email) {
        const emailName = user.email.split('@')[0]
        const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
        setFirstName(formattedName.split('.')[0]) // Take first part if email has dots
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch projects with assessment data
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects-landing'],
    queryFn: async () => {
      // First fetch basic projects data (exactly like DashboardPage does)
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        return []
      }

      // Transform data to match our interface
      const transformedProjects = (projectsData || []).map(project => {
        // Since we're not fetching related data, we'll use simpler defaults
        return {
          id: project.id,
          name: project.name || project.project_name || 'Untitled Project',
          gate: project.template_name || 'Gate 0',
          gateTitle: getGateTitle(project.template_name),
          value: formatValue(project.budget || project.project_value),
          sector: project.category || project.project_sector || 'Not specified',
          documentCount: 0, // We'll set this to 0 for now
          hasAssessment: false, // Default to false since we're not fetching assessments
          currentRating: null as 'GREEN' | 'AMBER' | 'RED' | null,
          lastAssessedDate: null,
          assessmentVersion: null,
          criteriaCount: null,
          greenCount: null,
          amberCount: null,
          redCount: null
        }
      })

      return transformedProjects as ProjectData[]
    }
  })

  const getGateTitle = (templateName: string | null): string => {
    const gateMap: Record<string, string> = {
      'Gate 0': 'Strategic Assessment',
      'Gate 1': 'Business Justification',
      'Gate 2': 'Delivery Strategy',
      'Gate 3': 'Investment Decision',
      'Gate 4': 'Readiness for Service',
      'Gate 5': 'Operations Review'
    }
    return gateMap[templateName || 'Gate 0'] || 'Gateway Review'
  }

  const formatValue = (budget: number | null): string => {
    if (!budget) return 'Not specified'
    if (budget >= 1000000000) return `£${(budget / 1000000000).toFixed(1)}B`
    if (budget >= 1000000) return `£${(budget / 1000000).toFixed(0)}M`
    if (budget >= 1000) return `£${(budget / 1000).toFixed(0)}K`
    return `£${budget}`
  }

  const formatDate = (date: Date): string => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getRatingClass = (rating: string | null): string => {
    if (!rating) return 'none'
    return rating.toLowerCase()
  }

  const handleQuickAction = (action: string) => {
    if (projects.length === 0) {
      // If no projects, show create modal
      setShowCreateModal(true)
    } else {
      // Navigate to first project with appropriate route
      const firstProject = projects[0]
      switch (action) {
        case 'upload':
          navigate(`/project/${firstProject.id}/documents`)
          break
        case 'assess':
          navigate(`/project/${firstProject.id}/overview`)
          break
        case 'criteria':
          navigate('/criteria')
          break
      }
    }
  }

  return (
    <>
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--gray-50)', minHeight: '100vh' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            Select a project to continue your gateway assessment
          </p>
        </div>

        {/* Projects Section */}
        <div style={{ marginBottom: '2.5rem' }}>
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
              color: 'var(--ink)'
            }}>
              Your Projects
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'var(--ink)',
                color: 'var(--white)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--ink-light)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--ink)'
              }}
            >
              <Plus size={16} />
              New Project
            </button>
          </div>

          {isLoading ? (
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center'
            }}>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              background: 'var(--white)',
              border: '2px dashed var(--border)',
              borderRadius: '12px',
              padding: '3rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                background: 'var(--gray-100)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <FolderOpen size={28} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '0.5rem'
              }}>
                No projects yet
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                maxWidth: '400px',
                margin: '0 auto 1.5rem'
              }}>
                Create your first project to start preparing for your gateway review
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: 'var(--ink)',
                  color: 'var(--white)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus size={18} />
                Create Project
              </button>
            </div>
          ) : (
            projects.map(project => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                style={{
                  display: 'block',
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
                className="project-card"
              >
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <div style={{
                    width: '6px',
                    flexShrink: 0,
                    background: project.currentRating
                      ? project.currentRating === 'GREEN' ? 'var(--green)'
                      : project.currentRating === 'AMBER' ? 'var(--amber)'
                      : 'var(--red)'
                      : 'var(--gray-200)'
                  }} />
                  <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.15rem',
                          fontWeight: 600,
                          color: 'var(--ink)'
                        }}>
                          {project.name}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.6rem',
                          background: 'var(--ink)',
                          borderRadius: '100px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'var(--white)'
                        }}>
                          {project.gate}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <DollarSign size={14} style={{ opacity: 0.6 }} />
                          {project.value}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Truck size={14} style={{ opacity: 0.6 }} />
                          {project.sector}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <File size={14} style={{ opacity: 0.6 }} />
                          {project.documentCount} document{project.documentCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      {project.hasAssessment ? (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontFamily: 'var(--font-display)',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: 'var(--white)',
                              background: project.currentRating === 'GREEN' ? 'var(--green)'
                                : project.currentRating === 'AMBER' ? 'var(--amber)'
                                : 'var(--red)'
                            }}>
                              {project.currentRating}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: 'var(--text-muted)',
                            marginTop: '0.35rem'
                          }}>
                            Gateway Rating
                          </div>
                        </div>
                      ) : (
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          background: 'var(--gray-100)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)'
                        }}>
                          Not yet assessed
                        </span>
                      )}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--gray-100)',
                        borderRadius: '8px',
                        color: 'var(--text-muted)',
                        transition: 'all 0.2s ease'
                      }}
                      className="project-arrow">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
                {project.hasAssessment && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--gray-50)',
                    borderTop: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    <Clock size={14} />
                    Last assessed <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>
                      {formatDate(project.lastAssessedDate!)}
                    </strong> • Version {project.assessmentVersion} • {project.criteriaCount} criteria evaluated •
                    {project.redCount! > 0 && ` ${project.redCount} red,`}
                    {project.amberCount! > 0 && ` ${project.amberCount} amber`}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--ink)'
            }}>
              Quick Actions
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            <button
              onClick={() => handleQuickAction('upload')}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              className="quick-action"
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--gray-100)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                flexShrink: 0
              }}>
                <Upload size={20} />
              </div>
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: '0.25rem'
                }}>
                  Upload Documents
                </h4>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4
                }}>
                  Add FBC, OBC, or supporting documents to your project
                </p>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('assess')}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              className="quick-action"
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--gray-100)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                flexShrink: 0
              }}>
                <RefreshCw size={20} />
              </div>
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: '0.25rem'
                }}>
                  Run Assessment
                </h4>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4
                }}>
                  Analyse documents against IPA gateway criteria
                </p>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('criteria')}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              className="quick-action"
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--gray-100)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                flexShrink: 0
              }}>
                <FileText size={20} />
              </div>
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: '0.25rem'
                }}>
                  View Criteria
                </h4>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4
                }}>
                  Browse IPA gateway assessment criteria by gate
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div>
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, var(--ink) 0%, var(--ink-light) 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              flexShrink: 0
            }}>
              <HelpCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '0.25rem'
              }}>
                Need help preparing for your gateway review?
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
              }}>
                Our AI-powered assessment helps you identify gaps before your IPA review. Upload your business case documents and get instant feedback.
              </p>
            </div>
            <Link
              to="/help"
              style={{
                color: 'var(--ink)',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              className="help-link"
            >
              Learn more
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(projectId) => {
          setShowCreateModal(false)
          navigate(`/project/${projectId}`)
        }}
      />

      {/* Add hover styles */}
      <style>{`
        .project-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border-color: #d1d5db;
        }

        .project-card:hover .project-arrow {
          background: var(--ink);
          color: var(--white);
        }

        .quick-action:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border-color: #d1d5db;
        }

        .help-link:hover {
          color: var(--copper);
        }

        @media (max-width: 768px) {
          .quick-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}