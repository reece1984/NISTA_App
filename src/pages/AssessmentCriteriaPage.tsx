import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, ExternalLink, AlertTriangle, X } from 'lucide-react'
import { supabase, type AssessmentTemplate } from '../lib/supabase'

interface AssessmentCriterion {
  id: number
  criterion_code: string
  dimension: string
  category: string
  title: string
  description: string
  assessment_question: string
  weight: number | null
  is_critical: boolean
  is_gateway_blocker?: boolean
  template_id: number
  page_ref?: number
}

interface CategoryGroup {
  category: string
  criteria: AssessmentCriterion[]
}

export default function AssessmentCriteriaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Initialize expanded categories when criteria changes
  useEffect(() => {
    if (criteria.length > 0) {
      const categories = [...new Set(criteria.map(c => c.category))]
      setExpandedCategories(new Set(categories))
    }
  }, [criteria])

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (templates.length === 0) return

    const templateId = searchParams.get('template')
    if (templateId) {
      const id = parseInt(templateId)
      const foundTemplate = templates.find(t => t.id === id)
      if (foundTemplate) {
        setSelectedTemplateId(id)
      } else {
        // If template ID from URL doesn't exist, use first template
        setSelectedTemplateId(templates[0].id)
      }
    } else if (selectedTemplateId === null) {
      // Only set default template if none is selected
      setSelectedTemplateId(templates[0].id)
    }
  }, [searchParams, templates]) // Removed selectedTemplateId to prevent circular dependency

  useEffect(() => {
    if (selectedTemplateId) {
      fetchCriteria(selectedTemplateId)
      // Only update URL if it doesn't already match to prevent loops
      const currentTemplateId = searchParams.get('template')
      if (currentTemplateId !== selectedTemplateId.toString()) {
        setSearchParams({ template: selectedTemplateId.toString() })
      }
    }
  }, [selectedTemplateId, searchParams, setSearchParams])

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('assessment_templates')
      .select('*')
      .order('name')

    if (!error && data) {
      setTemplates(data)
    }
  }

  const fetchCriteria = async (templateId: number) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('assessment_criteria')
      .select('*')
      .eq('template_id', templateId)
      .order('category')
      .order('criterion_code')

    if (!error && data) {
      setCriteria(data)
    }
    setLoading(false)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // Group criteria by category
  const groupedCriteria: CategoryGroup[] = criteria.reduce((acc: CategoryGroup[], criterion) => {
    const existing = acc.find(g => g.category === criterion.category)
    if (existing) {
      existing.criteria.push(criterion)
    } else {
      acc.push({
        category: criterion.category,
        criteria: [criterion]
      })
    }
    return acc
  }, [])

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
  const gateName = selectedTemplate?.name || 'Gate 0'
  const isPAR = gateName.toLowerCase().includes('par')
  const gateNumber = gateName.match(/Gate (\d+)/)?.[1] || '0'

  // Calculate stats
  const stats = {
    total: criteria.length,
    critical: criteria.filter(c => c.is_critical && !c.is_gateway_blocker).length,
    blockers: criteria.filter(c => c.is_gateway_blocker).length
  }

  const pdfUrl = isPAR ? null : `/documents/IPA_Gate_Review_Process_-_Gate_${gateNumber}.pdf`

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--gray-50)', minHeight: '100vh' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              marginBottom: '0.25rem'
            }}>
              Gate Review Criteria
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Assessment criteria for {selectedTemplate?.name || 'Gate Review'}
            </p>
          </div>

          {/* Gate Selector */}
          <div style={{
            display: 'flex',
            gap: '0.35rem',
            background: 'var(--white)',
            padding: '0.35rem',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            {templates.map(template => {
              const templateNameLower = template.name.toLowerCase()
              const templateCodeLower = template.code?.toLowerCase() || ''
              const isTemplatePAR = templateNameLower.includes('par') ||
                                   templateCodeLower === 'par' ||
                                   templateNameLower.includes('project assessment review')

              let displayLabel = 'G0'
              if (isTemplatePAR) {
                displayLabel = 'PAR'
              } else {
                const gateNum = template.name.match(/Gate (\d+)/)?.[1]
                if (gateNum) {
                  displayLabel = `G${gateNum}`
                }
              }

              const isActive = selectedTemplateId === template.id

              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    background: isActive ? 'var(--ink)' : 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    color: isActive ? 'var(--white)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--ink)'
                      e.currentTarget.style.background = 'var(--gray-100)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-muted)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {displayLabel}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading criteria...
          </div>
        ) : (
          <>
            {/* Info Card - Only show if PDF is available */}
            {pdfUrl && (
              <div style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(10, 22, 40, 0.05)',
                    border: '1px solid rgba(10, 22, 40, 0.12)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink)'
                  }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      marginBottom: '0.15rem'
                    }}>
                      IPA {selectedTemplate?.name} Review Workbook
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Official guidance document with detailed evidence requirements
                    </p>
                  </div>
                </div>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gray-100)'
                    e.currentTarget.style.borderColor = 'var(--ink-subtle)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--white)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  View PDF
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* Stats Card */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--ink)'
                  }}>
                    {stats.total}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 500
                  }}>
                    Total Criteria
                  </span>
                </div>
                {stats.critical > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--red)'
                    }}>
                      {stats.critical}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: 500
                    }}>
                      Critical
                    </span>
                  </div>
                )}
                {stats.blockers > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--red)'
                    }}>
                      {stats.blockers}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: 500
                    }}>
                      Gateway Blockers
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Category Sections */}
            {groupedCriteria.map(group => {
              const isExpanded = expandedCategories.has(group.category)
              const criticalCount = group.criteria.filter(c => c.is_critical || c.is_gateway_blocker).length

              return (
                <div
                  key={group.category}
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    marginBottom: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#d0cec9'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onClick={() => toggleCategory(group.category)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--gray-100)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '4px',
                        height: '36px',
                        background: 'var(--ink)',
                        borderRadius: '2px'
                      }} />
                      <div>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          color: 'var(--ink)'
                        }}>
                          {group.category}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.15rem'
                        }}>
                          {group.criteria.length} criteria
                          {criticalCount > 0 && (
                            <>
                              {' • '}
                              <span style={{ color: 'var(--red)', fontWeight: 500 }}>
                                {criticalCount} critical
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      background: 'var(--gray-100)',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Criteria List */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-light)' }}>
                      {group.criteria.map((criterion, index) => {
                        const isCritical = criterion.is_critical && !criterion.is_gateway_blocker
                        const isBlocker = criterion.is_gateway_blocker

                        return (
                          <div
                            key={criterion.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.875rem 1.25rem',
                              borderBottom: index < group.criteria.length - 1 ? '1px solid var(--border-light)' : 'none',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--gray-50)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <span style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--ink)',
                              width: '65px',
                              flexShrink: 0
                            }}>
                              {criterion.criterion_code}
                            </span>
                            <span style={{
                              flex: 1,
                              fontSize: '0.9rem',
                              color: 'var(--ink-light)',
                              paddingRight: '1rem',
                              lineHeight: 1.5
                            }}>
                              {criterion.assessment_question}
                            </span>
                            {isCritical && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.25rem 0.65rem',
                                background: 'var(--red-bg)',
                                border: '1px solid var(--red-border)',
                                borderRadius: '100px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: 'var(--red)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                              }}>
                                <AlertTriangle size={11} />
                                Critical
                              </span>
                            )}
                            {isBlocker && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.25rem 0.65rem',
                                background: 'rgba(220, 38, 38, 0.12)',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                borderRadius: '100px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: 'var(--red)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                              }}>
                                <X size={11} />
                                Blocker
                              </span>
                            )}
                            {!isCritical && !isBlocker && (
                              <span style={{ width: '75px' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
    </div>
  )
}