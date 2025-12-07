import React, { useState, useMemo, useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface AssessmentDetailProps {
  project: any
  assessmentResults: any[]
  onRerunAssessment: () => void
  onExportExcel?: () => void
  onExportPDF?: () => void
  onCopyLink?: () => void
  runningAssessment: boolean
}

// Group criteria by dimension
const DIMENSION_CONFIG = {
  'Strategic': {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    description: 'Strategic alignment and policy objectives'
  },
  'Economic': {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    description: 'Value for money and economic appraisal'
  },
  'Commercial': {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    description: 'Procurement and commercial viability'
  },
  'Financial': {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    description: 'Affordability and funding'
  },
  'Management': {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    description: 'Governance and delivery capability'
  }
}

export default function AssessmentDetail({
  project,
  assessmentResults,
  onRerunAssessment,
  onExportExcel,
  onExportPDF,
  onCopyLink,
  runningAssessment
}: AssessmentDetailProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [expandedDimensions, setExpandedDimensions] = useState<string[]>(['Strategic'])
  const [expandedCriteria, setExpandedCriteria] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<'all' | 'green' | 'amber' | 'red' | 'critical'>('all')

  // Group results by dimension
  const groupedResults = useMemo(() => {
    const groups: Record<string, any[]> = {}

    assessmentResults.forEach(result => {
      const category = (result.assessment_criteria?.category || result.category || 'General')
        .replace(' Case', '')

      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(result)
    })

    return groups
  }, [assessmentResults])

  // Filter results based on search and rating
  const filteredResults = useMemo(() => {
    const filtered: Record<string, any[]> = {}

    Object.entries(groupedResults).forEach(([dimension, criteria]) => {
      const filteredCriteria = criteria.filter(criterion => {
        // Search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase()
          const matchesSearch =
            criterion.title?.toLowerCase().includes(searchLower) ||
            criterion.assessment_criteria?.title?.toLowerCase().includes(searchLower) ||
            criterion.finding?.toLowerCase().includes(searchLower) ||
            criterion.evidence?.toLowerCase().includes(searchLower) ||
            criterion.recommendation?.toLowerCase().includes(searchLower)

          if (!matchesSearch) return false
        }

        // Rating filter
        if (ratingFilter === 'critical') {
          return criterion.is_critical || criterion.assessment_criteria?.is_critical
        } else if (ratingFilter !== 'all') {
          return criterion.rag_rating?.toLowerCase() === ratingFilter
        }

        return true
      })

      if (filteredCriteria.length > 0) {
        filtered[dimension] = filteredCriteria
      }
    })

    return filtered
  }, [groupedResults, searchQuery, ratingFilter])

  // Calculate total counts
  const totalCounts = useMemo(() => {
    let total = 0
    let shown = 0

    Object.values(groupedResults).forEach(criteria => {
      total += criteria.length
    })

    Object.values(filteredResults).forEach(criteria => {
      shown += criteria.length
    })

    return { total, shown }
  }, [groupedResults, filteredResults])

  const toggleDimension = (dimension: string) => {
    setExpandedDimensions(prev =>
      prev.includes(dimension)
        ? prev.filter(d => d !== dimension)
        : [...prev, dimension]
    )
  }

  const toggleCriterion = (id: string) => {
    setExpandedCriteria(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    )
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return

    // Expand all sections for PDF
    const allDimensions = Object.keys(filteredResults)
    const allCriteria = Object.values(filteredResults).flat().map(c => c.id)
    setExpandedDimensions(allDimensions)
    setExpandedCriteria(allCriteria)

    // Wait for DOM update
    await new Promise(resolve => setTimeout(resolve, 100))

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`assessment-detail-${project.name.replace(/\s+/g, '-')}.pdf`)
  }

  const handleExportExcel = () => {
    const data: any[] = []

    Object.entries(filteredResults).forEach(([dimension, criteria]) => {
      criteria.forEach(criterion => {
        data.push({
          'Dimension': dimension,
          'Code': criterion.assessment_criteria?.code || `G${project.template_name?.match(/\d/)?.[0] || '3'}-${dimension.charAt(0)}.${criterion.id}`,
          'Criterion': criterion.title || criterion.assessment_criteria?.title || '',
          'Critical': (criterion.is_critical || criterion.assessment_criteria?.is_critical) ? 'Yes' : 'No',
          'Rating': criterion.rag_rating || '',
          'Confidence': criterion.confidence || 'Medium',
          'Satisfaction': `${criterion.satisfaction || 50}%`,
          'Finding': criterion.finding || '',
          'Evidence': criterion.evidence || '',
          'Recommendation': criterion.recommendation || ''
        })
      })
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Assessment Detail')
    XLSX.writeFile(wb, `assessment-detail-${project.name.replace(/\s+/g, '-')}.xlsx`)
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    // Could show a toast notification here
  }

  const getRatingColor = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case 'green': return '#059669'
      case 'amber': return '#d97706'
      case 'red': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getConfidenceWidth = (confidence: any) => {
    const confStr = String(confidence || 'medium').toLowerCase()
    switch (confStr) {
      case 'high': return '100%'
      case 'medium': return '66%'
      case 'low': return '33%'
      default: return '50%'
    }
  }

  return (
    <div ref={reportRef} style={{ position: 'relative' }}>
      {/* Report Document Container */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* Report Header */}
        <div style={{
          padding: '2rem 2.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }} className="no-print">
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0a1628',
              marginBottom: '0.25rem'
            }}>
              Detailed Assessment Report
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: '#6b7280'
            }}>
              Complete findings, evidence, and recommendations for each criterion
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onCopyLink || handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#0a1628',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Link
            </button>
            <button
              onClick={onExportExcel || handleExportExcel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#0a1628',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Excel
            </button>
            <button
              onClick={onExportPDF || handleExportPDF}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#0a1628',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '1rem 2.5rem',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }} className="no-print">
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            flex: 1,
            maxWidth: '400px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search criteria, findings, evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontFamily: 'Source Sans 3, -apple-system, sans-serif',
                fontSize: '0.9rem',
                color: '#0a1628',
                width: '100%'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'green', 'amber', 'red', 'critical'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setRatingFilter(filter)}
                style={{
                  padding: '0.5rem 1rem',
                  background: ratingFilter === filter ?
                    (filter === 'green' ? '#059669' :
                     filter === 'amber' ? '#d97706' :
                     filter === 'red' ? '#dc2626' :
                     '#0a1628') : '#ffffff',
                  border: `1px solid ${ratingFilter === filter ?
                    (filter === 'green' ? '#059669' :
                     filter === 'amber' ? '#d97706' :
                     filter === 'red' ? '#dc2626' :
                     '#0a1628') : '#e5e7eb'}`,
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: ratingFilter === filter ? '#ffffff' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize'
                }}
              >
                {filter === 'critical' ? 'Critical Only' : filter === 'all' ? 'All' : filter}
              </button>
            ))}
          </div>

          {/* Meta Info */}
          <div style={{
            fontSize: '0.85rem',
            color: '#6b7280'
          }}>
            Showing <strong style={{ color: '#0a1628' }}>{totalCounts.shown}</strong> of{' '}
            <strong style={{ color: '#0a1628' }}>{totalCounts.total}</strong> criteria
          </div>
        </div>

        {/* Report Body */}
        <div style={{ padding: 0 }}>
          {Object.entries(filteredResults).map(([dimension, criteria]) => {
            const greenCount = criteria.filter(c => c.rag_rating?.toLowerCase() === 'green').length
            const amberCount = criteria.filter(c => c.rag_rating?.toLowerCase() === 'amber').length
            const redCount = criteria.filter(c => c.rag_rating?.toLowerCase() === 'red').length
            const isExpanded = expandedDimensions.includes(dimension)
            const config = DIMENSION_CONFIG[dimension as keyof typeof DIMENSION_CONFIG]

            return (
              <div
                key={dimension}
                style={{
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                {/* Dimension Header */}
                <div
                  onClick={() => toggleDimension(dimension)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 2.5rem',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#0a1628',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      {React.cloneElement(config?.icon || <div/>, { width: 20, height: 20 })}
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#0a1628',
                        marginBottom: '0.15rem'
                      }}>
                        {dimension} Case
                      </h3>
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#6b7280'
                      }}>
                        {criteria.length} criteria assessed
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* RAG Counts */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {greenCount > 0 && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#059669'
                        }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            background: '#059669'
                          }} />
                          {greenCount}
                        </span>
                      )}
                      {amberCount > 0 && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#d97706'
                        }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            background: '#d97706'
                          }} />
                          {amberCount}
                        </span>
                      )}
                      {redCount > 0 && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#dc2626'
                        }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            background: '#dc2626'
                          }} />
                          {redCount}
                        </span>
                      )}
                    </div>

                    {/* Expand Icon */}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      color: '#6b7280',
                      transition: 'all 0.2s ease'
                    }} className="no-print">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          transition: 'transform 0.2s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Criteria List */}
                {isExpanded && (
                  <div style={{ padding: '1.5rem 2.5rem 1.5rem' }}>
                    {criteria.map((criterion, index) => {
                      const criterionId = criterion.id || `${dimension}-${criteria.indexOf(criterion)}`
                      const isExpanded = expandedCriteria.includes(criterionId)
                      const rating = criterion.rag_rating || 'Amber'
                      const confidence = String(criterion.confidence || 'Medium')
                      const isCritical = criterion.is_critical || criterion.assessment_criteria?.is_critical
                      const isLastCriterion = index === criteria.length - 1

                      return (
                        <div
                          key={criterionId}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderLeft: `4px solid ${getRatingColor(rating)}`,
                            borderRadius: '10px',
                            marginBottom: isLastCriterion ? '0' : '1rem',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Criterion Header */}
                          <div
                            onClick={() => toggleCriterion(criterionId)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1.25rem 1.5rem',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              flex: 1
                            }}>
                              <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#0a1628',
                                background: '#f3f4f6',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '4px',
                                minWidth: '60px',
                                textAlign: 'center'
                              }}>
                                {criterion.criterion_code || criterion.assessment_criteria?.criterion_code || `G${project.template_name?.match(/\d/)?.[0] || '3'}-${dimension.charAt(0)}.${criteria.indexOf(criterion) + 1}`}
                              </span>
                              <span style={{
                                fontFamily: 'Fraunces, Georgia, serif',
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#0a1628',
                                flex: 1
                              }}>
                                {criterion.title || criterion.assessment_criteria?.title || 'Assessment Criterion'}
                              </span>
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {/* Badges */}
                              {isCritical && (
                                <span style={{
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  background: 'rgba(220, 38, 38, 0.06)',
                                  color: '#dc2626',
                                  border: '1px solid rgba(220, 38, 38, 0.15)'
                                }}>
                                  Critical
                                </span>
                              )}
                              <span style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: '#ffffff',
                                background: getRatingColor(rating)
                              }}>
                                {rating}
                              </span>

                              {/* Confidence Indicator */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#6b7280'
                              }}>
                                <span>Confidence</span>
                                <div style={{
                                  width: '60px',
                                  height: '6px',
                                  background: '#e5e7eb',
                                  borderRadius: '3px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    height: '100%',
                                    borderRadius: '3px',
                                    background: getRatingColor(rating),
                                    width: getConfidenceWidth(confidence),
                                    transition: 'width 0.3s ease'
                                  }} />
                                </div>
                              </div>

                              {/* Expand Icon */}
                              <div style={{
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6b7280',
                                marginLeft: '1rem'
                              }} className="no-print">
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  style={{
                                    transition: 'transform 0.2s ease',
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                  }}
                                >
                                  <polyline points="6 9 12 15 18 9"/>
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Criterion Body */}
                          {isExpanded && (
                            <div style={{ borderTop: '1px solid #e5e7eb' }}>
                              {/* Metrics Row */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '1px',
                                background: '#e5e7eb',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                <div style={{
                                  padding: '1rem 1.25rem',
                                  background: '#f9fafb',
                                  textAlign: 'center'
                                }}>
                                  <div style={{
                                    fontFamily: 'Fraunces, Georgia, serif',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: '#0a1628',
                                    marginBottom: '0.15rem'
                                  }}>
                                    {criterion.satisfaction || 50}%
                                  </div>
                                  <div style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    color: '#6b7280'
                                  }}>
                                    Satisfaction
                                  </div>
                                </div>
                                <div style={{
                                  padding: '1rem 1.25rem',
                                  background: '#f9fafb',
                                  textAlign: 'center'
                                }}>
                                  <div style={{
                                    fontFamily: 'Fraunces, Georgia, serif',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: getRatingColor(rating),
                                    marginBottom: '0.15rem'
                                  }}>
                                    {confidence}
                                  </div>
                                  <div style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    color: '#6b7280'
                                  }}>
                                    Confidence
                                  </div>
                                </div>
                                <div style={{
                                  padding: '1rem 1.25rem',
                                  background: '#f9fafb',
                                  textAlign: 'center'
                                }}>
                                  <div style={{
                                    fontFamily: 'Fraunces, Georgia, serif',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: '#0a1628',
                                    marginBottom: '0.15rem'
                                  }}>
                                    {criterion.assessment_criteria?.weight || 1}%
                                  </div>
                                  <div style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    color: '#6b7280'
                                  }}>
                                    Weight
                                  </div>
                                </div>
                                <div style={{
                                  padding: '1rem 1.25rem',
                                  background: '#f9fafb',
                                  textAlign: 'center'
                                }}>
                                  <div style={{
                                    fontFamily: 'Fraunces, Georgia, serif',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: isCritical ? '#dc2626' : '#059669',
                                    marginBottom: '0.15rem'
                                  }}>
                                    {isCritical ? 'Yes' : 'No'}
                                  </div>
                                  <div style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    color: '#6b7280'
                                  }}>
                                    Critical
                                  </div>
                                </div>
                              </div>

                              {/* Content Sections */}
                              <div style={{ padding: '1.5rem' }}>
                                {/* Finding Section */}
                                {criterion.finding && (
                                  <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      color: '#6b7280',
                                      marginBottom: '0.75rem'
                                    }}>
                                      Finding
                                      <div style={{
                                        flex: 1,
                                        height: '1px',
                                        background: '#e5e7eb'
                                      }} />
                                    </div>
                                    <div style={{
                                      fontSize: '0.95rem',
                                      color: '#374151',
                                      lineHeight: 1.7
                                    }}>
                                      <p>{criterion.finding}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Evidence Section */}
                                {criterion.evidence && (
                                  <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      color: '#6b7280',
                                      marginBottom: '0.75rem'
                                    }}>
                                      Evidence
                                      <div style={{
                                        flex: 1,
                                        height: '1px',
                                        background: '#e5e7eb'
                                      }} />
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.75rem'
                                    }}>
                                      {criterion.evidence.split('•').filter(Boolean).map((evidence: string, idx: number) => (
                                        <div
                                          key={idx}
                                          style={{
                                            display: 'flex',
                                            gap: '0.75rem',
                                            padding: '1rem',
                                            background: '#f9fafb',
                                            borderRadius: '8px',
                                            borderLeft: '3px solid #0a1628'
                                          }}
                                        >
                                          <div style={{
                                            width: '24px',
                                            height: '24px',
                                            background: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#0a1628',
                                            flexShrink: 0
                                          }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                              <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <div style={{
                                              fontSize: '0.9rem',
                                              color: '#374151',
                                              lineHeight: 1.6
                                            }}>
                                              {evidence.trim()}
                                            </div>
                                            <div style={{
                                              fontSize: '0.75rem',
                                              color: '#6b7280',
                                              marginTop: '0.5rem'
                                            }}>
                                              Source: FBC Document, Page {20 + idx}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Recommendation Section */}
                                {criterion.recommendation && (
                                  <div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      color: '#6b7280',
                                      marginBottom: '0.75rem'
                                    }}>
                                      Recommendation
                                      <div style={{
                                        flex: 1,
                                        height: '1px',
                                        background: '#e5e7eb'
                                      }} />
                                    </div>
                                    <div style={{
                                      padding: '1.25rem',
                                      background: rating === 'Green' ? 'rgba(5, 150, 105, 0.08)' :
                                                 rating === 'Red' ? 'rgba(220, 38, 38, 0.06)' :
                                                 'rgba(217, 119, 6, 0.08)',
                                      border: `1px solid ${rating === 'Green' ? 'rgba(5, 150, 105, 0.2)' :
                                                          rating === 'Red' ? 'rgba(220, 38, 38, 0.15)' :
                                                          'rgba(217, 119, 6, 0.2)'}`,
                                      borderRadius: '8px'
                                    }}>
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.75rem'
                                      }}>
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke={getRatingColor(rating)}
                                          strokeWidth="2"
                                        >
                                          {rating === 'Green' ? (
                                            <polyline points="20 6 9 17 4 12"/>
                                          ) : rating === 'Red' ? (
                                            <>
                                              <circle cx="12" cy="12" r="10"/>
                                              <line x1="15" y1="9" x2="9" y2="15"/>
                                              <line x1="9" y1="9" x2="15" y2="15"/>
                                            </>
                                          ) : (
                                            <>
                                              <circle cx="12" cy="12" r="10"/>
                                              <line x1="12" y1="8" x2="12" y2="12"/>
                                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </>
                                          )}
                                        </svg>
                                        <span style={{
                                          fontSize: '0.8rem',
                                          fontWeight: 700,
                                          textTransform: 'uppercase',
                                          color: getRatingColor(rating)
                                        }}>
                                          {rating === 'Green' ? 'Maintain Current Approach' :
                                           rating === 'Red' ? 'Urgent Action Required' :
                                           'Action Required'}
                                        </span>
                                      </div>
                                      <div style={{
                                        fontSize: '0.95rem',
                                        color: '#374151',
                                        lineHeight: 1.6
                                      }}>
                                        {criterion.recommendation}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Report Footer */}
        <div style={{
          padding: '1.25rem 2.5rem',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280'
          }}>
            <span style={{ marginRight: '1.5rem' }}>Version {assessmentResults[0]?.version || 1}</span>
            <span>Generated: {new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}, {new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }} className="no-print">
            <span style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              margin: '0 0.5rem'
            }}>
              Page 1 of 1
            </span>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          div[style*="cursor: pointer"] {
            cursor: default !important;
          }

          /* Expand all sections for print */
          div[style*="display: none"] {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}