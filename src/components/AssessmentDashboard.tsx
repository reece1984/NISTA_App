import React, { useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx'

interface AssessmentDashboardProps {
  project: any
  assessmentResults: any[]
  onNavigateToDetail?: (criterionId?: string) => void
  onNavigateToActions?: () => void
}

interface FilterState {
  rating: 'all' | 'green' | 'amber' | 'red'
  dimension: 'all' | 'strategic' | 'economic' | 'commercial' | 'financial' | 'management'
  criticalOnly: boolean
}

interface DashboardMetrics {
  overallRating: 'GREEN' | 'AMBER' | 'RED'
  totalCriteria: number
  greenCount: number
  amberCount: number
  redCount: number
  greenPercent: number
  amberPercent: number
  redPercent: number
  dimensions: DimensionBreakdown[]
  priorityActions: PriorityAction[]
  trends: TrendData
}

interface DimensionBreakdown {
  name: string
  total: number
  green: number
  amber: number
  red: number
  greenPercent: number
  amberPercent: number
  redPercent: number
}

interface PriorityAction {
  id: string
  code: string
  title: string
  rating: 'RED' | 'AMBER'
  isCritical: boolean
  description: string
  dimension: string
}

interface TrendData {
  greenChange: number
  amberChange: number
  redChange: number
  previousVersion: number | null
}

export default function AssessmentDashboard({
  project,
  assessmentResults,
  onNavigateToDetail,
  onNavigateToActions
}: AssessmentDashboardProps) {
  const [filterState, setFilterState] = useState<FilterState>({
    rating: 'all',
    dimension: 'all',
    criticalOnly: false
  })

  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedKpiCard, setSelectedKpiCard] = useState<string | null>(null)

  // Calculate metrics from assessment results
  const metrics = useMemo((): DashboardMetrics => {
    // Filter results based on current filter state
    let filteredResults = [...assessmentResults]

    if (filterState.rating !== 'all') {
      filteredResults = filteredResults.filter(r =>
        r.rag_rating?.toLowerCase() === filterState.rating
      )
    }

    if (filterState.dimension !== 'all') {
      const dimensionMap = {
        'strategic': 'Strategic',
        'economic': 'Economic',
        'commercial': 'Commercial',
        'financial': 'Financial',
        'management': 'Management'
      }
      const targetDimension = dimensionMap[filterState.dimension as keyof typeof dimensionMap]
      filteredResults = filteredResults.filter(r => {
        const category = (r.assessment_criteria?.category || '').replace(' Case', '')
        return category === targetDimension
      })
    }

    if (filterState.criticalOnly) {
      filteredResults = filteredResults.filter(r =>
        r.assessment_criteria?.is_critical
      )
    }

    // Calculate basic counts (use filtered results)
    const totalCriteria = filteredResults.length
    const greenCount = filteredResults.filter(r => r.rag_rating?.toLowerCase() === 'green').length
    const amberCount = filteredResults.filter(r => r.rag_rating?.toLowerCase() === 'amber').length
    const redCount = filteredResults.filter(r => r.rag_rating?.toLowerCase() === 'red').length

    // Calculate percentages
    const greenPercent = totalCriteria ? Math.round((greenCount / totalCriteria) * 100) : 0
    const amberPercent = totalCriteria ? Math.round((amberCount / totalCriteria) * 100) : 0
    const redPercent = totalCriteria ? Math.round((redCount / totalCriteria) * 100) : 0

    // Determine overall rating
    const criticalRed = filteredResults.filter(r =>
      r.rag_rating?.toLowerCase() === 'red' && r.assessment_criteria?.is_critical
    ).length

    let overallRating: 'GREEN' | 'AMBER' | 'RED'
    if (criticalRed > 0 || redCount >= totalCriteria * 0.2) {
      overallRating = 'RED'
    } else if (amberCount >= totalCriteria * 0.3) {
      overallRating = 'AMBER'
    } else {
      overallRating = 'GREEN'
    }

    // Calculate dimension breakdown
    const dimensions: DimensionBreakdown[] = ['Strategic', 'Economic', 'Commercial', 'Financial', 'Management'].map(dim => {
      const dimResults = filteredResults.filter(r => {
        const category = (r.assessment_criteria?.category || '').replace(' Case', '')
        return category === dim
      })

      const total = dimResults.length
      const green = dimResults.filter(r => r.rag_rating?.toLowerCase() === 'green').length
      const amber = dimResults.filter(r => r.rag_rating?.toLowerCase() === 'amber').length
      const red = dimResults.filter(r => r.rag_rating?.toLowerCase() === 'red').length

      return {
        name: dim,
        total,
        green,
        amber,
        red,
        greenPercent: total ? Math.round((green / total) * 100) : 0,
        amberPercent: total ? Math.round((amber / total) * 100) : 0,
        redPercent: total ? Math.round((red / total) * 100) : 0
      }
    })

    // Get priority actions (RED and AMBER items from filtered results)
    const allPriorityItems = filteredResults
      .filter(r => r.rag_rating?.toLowerCase() === 'red' || r.rag_rating?.toLowerCase() === 'amber')

    const priorityActions: PriorityAction[] = allPriorityItems
      .sort((a, b) => {
        // Sort by: RED first, then critical, then by dimension
        const aRating = a.rag_rating?.toLowerCase()
        const bRating = b.rag_rating?.toLowerCase()
        if (aRating !== bRating) {
          return aRating === 'red' ? -1 : 1
        }
        const aCritical = a.assessment_criteria?.is_critical
        const bCritical = b.assessment_criteria?.is_critical
        if (aCritical !== bCritical) {
          return aCritical ? -1 : 1
        }
        return 0
      })
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        code: r.assessment_criteria?.criterion_code || r.assessment_criteria?.ipa_reference || `G${project.template_name?.match(/\d/)?.[0] || '3'}-${r.id}`,
        title: r.assessment_criteria?.title || 'Assessment Criterion',
        rating: r.rag_rating?.toUpperCase() as 'RED' | 'AMBER',
        isCritical: r.assessment_criteria?.is_critical || false,
        description: r.finding || r.assessment_criteria?.description || '',
        dimension: (r.assessment_criteria?.category || 'General').replace(' Case', '')
      }))

    // Calculate trends - simulate with sample data for now
    // In real implementation, would compare with previous assessment run
    const trends: TrendData = {
      greenChange: project.assessmentRunId ? 2 : 0, // Mock: +2 if not first assessment
      amberChange: project.assessmentRunId ? -1 : 0, // Mock: -1 if not first assessment
      redChange: project.assessmentRunId ? -1 : 0, // Mock: -1 if not first assessment
      previousVersion: project.assessmentRunId ? 1 : null
    }

    return {
      overallRating,
      totalCriteria,
      greenCount,
      amberCount,
      redCount,
      greenPercent,
      amberPercent,
      redPercent,
      dimensions,
      priorityActions,
      trends,
      totalPriorityActions: allPriorityItems.length
    } as DashboardMetrics & { totalPriorityActions: number }
  }, [assessmentResults, filterState, project])

  // Handle KPI card clicks
  const handleKpiCardClick = (rating: string) => {
    if (selectedKpiCard === rating) {
      setSelectedKpiCard(null)
      setFilterState(prev => ({ ...prev, rating: 'all' }))
    } else {
      setSelectedKpiCard(rating)
      setFilterState(prev => ({ ...prev, rating: rating as any }))
    }
  }

  // Handle filter changes
  const handleRatingFilter = (rating: FilterState['rating']) => {
    setFilterState(prev => ({ ...prev, rating }))
    setSelectedKpiCard(rating === 'all' ? null : rating)
  }

  const handleDimensionFilter = (dimension: FilterState['dimension']) => {
    setFilterState(prev => ({ ...prev, dimension }))
  }

  const handleCriticalOnlyToggle = () => {
    setFilterState(prev => ({ ...prev, criticalOnly: !prev.criticalOnly }))
  }

  // Handle chart interactions
  const handleDonutSegmentClick = (rating: string) => {
    handleRatingFilter(rating.toLowerCase() as FilterState['rating'])
  }

  const handleDimensionBarClick = (dimension: string, rating?: string) => {
    setFilterState(prev => ({
      ...prev,
      dimension: dimension.toLowerCase() as FilterState['dimension'],
      rating: rating ? rating.toLowerCase() as FilterState['rating'] : prev.rating
    }))
  }

  // Export functionality
  const handleExport = () => {
    const data = assessmentResults.map(r => ({
      'Dimension': (r.assessment_criteria?.category || 'General').replace(' Case', ''),
      'Code': r.assessment_criteria?.criterion_code || r.assessment_criteria?.ipa_reference || `G${project.template_name?.match(/\d/)?.[0] || '3'}-${r.id}`,
      'Title': r.assessment_criteria?.title || '',
      'Critical': r.assessment_criteria?.is_critical ? 'Yes' : 'No',
      'Rating': r.rag_rating?.toUpperCase() || '',
      'Confidence': r.confidence || 'Medium',
      'Finding': r.finding || '',
      'Evidence': r.evidence || '',
      'Recommendation': r.recommendation || ''
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Data')
    XLSX.writeFile(wb, `dashboard-${project.name.replace(/\s+/g, '-')}.xlsx`)
  }

  // Calculate donut chart segments correctly
  const radius = 70
  const circumference = 2 * Math.PI * radius // Exactly 2πr
  const greenDash = (metrics.greenPercent / 100) * circumference
  const amberDash = (metrics.amberPercent / 100) * circumference
  const redDash = (metrics.redPercent / 100) * circumference

  const getOverallRatingIcon = () => {
    switch (metrics.overallRating) {
      case 'GREEN':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )
      case 'AMBER':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        )
      case 'RED':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )
    }
  }

  const getOverallRatingText = () => {
    switch (metrics.overallRating) {
      case 'GREEN': return 'Ready to proceed'
      case 'AMBER': return 'Proceed with conditions'
      case 'RED': return 'Not ready to proceed'
    }
  }

  const getTrendIndicator = (change: number, type: 'green' | 'amber' | 'red') => {
    if (change === 0 || !metrics.trends.previousVersion) return null

    const isPositive = (type === 'green' && change > 0) || ((type === 'amber' || type === 'red') && change < 0)
    const direction = change > 0 ? 'up' : 'down'
    const symbol = change > 0 ? '↑' : '↓'

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        marginTop: '0.5rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        background: isPositive ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.06)',
        color: isPositive ? '#059669' : '#dc2626'
      }}>
        {symbol} {Math.abs(change)} vs last run
      </span>
    )
  }

  // Calculate total priority actions correctly
  const totalPriorityActions = assessmentResults.filter(r =>
    r.rag_rating?.toLowerCase() === 'red' || r.rag_rating?.toLowerCase() === 'amber'
  ).length

  return (
    <div style={{ position: 'relative' }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#0a1628',
            marginBottom: '0.25rem'
          }}>
            Assessment Dashboard
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            fontFamily: 'Source Sans 3, sans-serif'
          }}>
            Visual analysis of assessment results • Click any element to filter
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: showFilterPanel ? '#0a1628' : '#ffffff',
              border: `1px solid ${showFilterPanel ? '#0a1628' : '#e5e7eb'}`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: showFilterPanel ? '#ffffff' : '#0a1628',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Source Sans 3, sans-serif'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters
          </button>
          <button
            onClick={handleExport}
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
              transition: 'all 0.2s ease',
              fontFamily: 'Source Sans 3, sans-serif'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Rating Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#6b7280',
                fontFamily: 'Source Sans 3, sans-serif'
              }}>
                Rating:
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {(['all', 'green', 'amber', 'red'] as const).map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: filterState.rating === rating ?
                        (rating === 'green' ? '#059669' :
                         rating === 'amber' ? '#d97706' :
                         rating === 'red' ? '#dc2626' :
                         '#0a1628') : '#f3f4f6',
                      border: '1px solid transparent',
                      borderRadius: '100px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: filterState.rating === rating ? '#ffffff' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textTransform: 'capitalize',
                      fontFamily: 'Source Sans 3, sans-serif'
                    }}
                  >
                    {rating === 'all' ? 'All' : rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#6b7280',
                fontFamily: 'Source Sans 3, sans-serif'
              }}>
                Dimension:
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {(['all', 'strategic', 'economic', 'commercial', 'financial', 'management'] as const).map(dim => (
                  <button
                    key={dim}
                    onClick={() => handleDimensionFilter(dim)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: filterState.dimension === dim ? '#0a1628' : '#f3f4f6',
                      border: '1px solid transparent',
                      borderRadius: '100px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: filterState.dimension === dim ? '#ffffff' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textTransform: 'capitalize',
                      fontFamily: 'Source Sans 3, sans-serif'
                    }}
                  >
                    {dim === 'all' ? 'All' : dim}
                  </button>
                ))}
              </div>
            </div>

            {/* Critical Only Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={filterState.criticalOnly}
                  onChange={handleCriticalOnlyToggle}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#6b7280',
                  fontFamily: 'Source Sans 3, sans-serif'
                }}>
                  Critical Only
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Overall Rating Card */}
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${selectedKpiCard === 'overall' ? '#0a1628' : '#e5e7eb'}`,
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: selectedKpiCard === 'overall' ? '0 0 0 1px #0a1628' : '0 1px 2px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6b7280',
              fontFamily: 'Source Sans 3, sans-serif'
            }}>
              Overall Rating
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: metrics.overallRating === 'GREEN' ? 'rgba(5, 150, 105, 0.08)' :
                        metrics.overallRating === 'AMBER' ? 'rgba(217, 119, 6, 0.08)' :
                        'rgba(220, 38, 38, 0.06)',
              color: metrics.overallRating === 'GREEN' ? '#059669' :
                    metrics.overallRating === 'AMBER' ? '#d97706' :
                    '#dc2626'
            }}>
              {React.cloneElement(getOverallRatingIcon()!, { width: 16, height: 16 })}
            </div>
          </div>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: metrics.overallRating === 'GREEN' ? '#059669' :
                  metrics.overallRating === 'AMBER' ? '#d97706' :
                  '#dc2626',
            lineHeight: 1,
            marginBottom: '0.25rem'
          }}>
            {metrics.overallRating}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            fontFamily: 'Source Sans 3, sans-serif'
          }}>
            {getOverallRatingText()}
          </div>
          {!metrics.trends.previousVersion && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              marginTop: '0.5rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: 'rgba(107, 114, 128, 0.08)',
              color: '#6b7280',
              fontFamily: 'Source Sans 3, sans-serif'
            }}>
              First assessment
            </span>
          )}
        </div>

        {/* Green Criteria Card */}
        <div
          onClick={() => handleKpiCardClick('green')}
          style={{
            background: '#ffffff',
            border: `1px solid ${selectedKpiCard === 'green' ? '#0a1628' : '#e5e7eb'}`,
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: selectedKpiCard === 'green' ? '0 0 0 1px #0a1628' : '0 1px 2px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6b7280',
              fontFamily: 'Source Sans 3, sans-serif'
            }}>
              Green Criteria
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 150, 105, 0.08)',
              color: '#059669'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#059669',
            lineHeight: 1,
            marginBottom: '0.25rem'
          }}>
            {metrics.greenCount}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            fontFamily: 'Source Sans 3, sans-serif'
          }}>
            {metrics.greenPercent}% of criteria
          </div>
          {getTrendIndicator(metrics.trends.greenChange, 'green')}
        </div>

        {/* Amber Criteria Card */}
        <div
          onClick={() => handleKpiCardClick('amber')}
          style={{
            background: '#ffffff',
            border: `1px solid ${selectedKpiCard === 'amber' ? '#0a1628' : '#e5e7eb'}`,
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: selectedKpiCard === 'amber' ? '0 0 0 1px #0a1628' : '0 1px 2px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6b7280',
              fontFamily: 'Source Sans 3, sans-serif'
            }}>
              Amber Criteria
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(217, 119, 6, 0.08)',
              color: '#d97706'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
            </div>
          </div>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#d97706',
            lineHeight: 1,
            marginBottom: '0.25rem'
          }}>
            {metrics.amberCount}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            fontFamily: 'Source Sans 3, sans-serif'
          }}>
            {metrics.amberPercent}% of criteria
          </div>
          {getTrendIndicator(metrics.trends.amberChange, 'amber')}
        </div>

        {/* Red Criteria Card */}
        <div
          onClick={() => handleKpiCardClick('red')}
          style={{
            background: '#ffffff',
            border: `1px solid ${selectedKpiCard === 'red' ? '#0a1628' : '#e5e7eb'}`,
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: selectedKpiCard === 'red' ? '0 0 0 1px #0a1628' : '0 1px 2px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6b7280',
              fontFamily: 'Source Sans 3, sans-serif'
            }}>
              Red Criteria
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(220, 38, 38, 0.06)',
              color: '#dc2626'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          </div>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#dc2626',
            lineHeight: 1,
            marginBottom: '0.25rem'
          }}>
            {metrics.redCount}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            fontFamily: 'Source Sans 3, sans-serif'
          }}>
            {metrics.redPercent}% of criteria
          </div>
          {getTrendIndicator(metrics.trends.redChange, 'red')}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 380px',
        gap: '1.5rem'
      }}>
        {/* RAG Distribution Chart */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div>
              <h3 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#0a1628'
              }}>
                RAG Distribution
              </h3>
              <p style={{
                fontSize: '0.8rem',
                color: '#6b7280',
                marginTop: '0.15rem',
                fontFamily: 'Source Sans 3, sans-serif'
              }}>
                Assessment breakdown by status
              </p>
            </div>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Donut Chart */}
              <div style={{
                width: '180px',
                height: '180px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  {/* Background circle */}
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="32"
                  />
                  {/* Green segment */}
                  {metrics.greenCount > 0 && (
                    <circle
                      className="donut-segment"
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="32"
                      strokeDasharray={`${greenDash} ${circumference}`}
                      strokeDashoffset="0"
                      onClick={() => handleDonutSegmentClick('green')}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  )}
                  {/* Amber segment */}
                  {metrics.amberCount > 0 && (
                    <circle
                      className="donut-segment"
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="32"
                      strokeDasharray={`${amberDash} ${circumference}`}
                      strokeDashoffset={`-${greenDash}`}
                      onClick={() => handleDonutSegmentClick('amber')}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  )}
                  {/* Red segment */}
                  {metrics.redCount > 0 && (
                    <circle
                      className="donut-segment"
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="32"
                      strokeDasharray={`${redDash} ${circumference}`}
                      strokeDashoffset={`-${greenDash + amberDash}`}
                      onClick={() => handleDonutSegmentClick('red')}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  )}
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#0a1628'
                  }}>
                    {metrics.totalCriteria}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    fontFamily: 'Source Sans 3, sans-serif'
                  }}>
                    Criteria
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem'
              }}>
                {[
                  { color: '#059669', label: 'Green', count: metrics.greenCount },
                  { color: '#d97706', label: 'Amber', count: metrics.amberCount },
                  { color: '#dc2626', label: 'Red', count: metrics.redCount }
                ].map(item => (
                  <div
                    key={item.label}
                    onClick={() => handleDonutSegmentClick(item.label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: item.color
                    }} />
                    <span style={{
                      fontSize: '0.85rem',
                      color: '#0a1628',
                      fontFamily: 'Source Sans 3, sans-serif'
                    }}>
                      <span style={{ fontWeight: 700, fontFamily: 'Fraunces, Georgia, serif' }}>{item.count}</span> {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assessment by Dimension */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div>
              <h3 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#0a1628'
              }}>
                Assessment by Dimension
              </h3>
              <p style={{
                fontSize: '0.8rem',
                color: '#6b7280',
                marginTop: '0.15rem',
                fontFamily: 'Source Sans 3, sans-serif'
              }}>
                Performance across the five cases
              </p>
            </div>
            <button
              onClick={() => onNavigateToDetail?.()}
              style={{
                fontSize: '0.8rem',
                color: '#0a1628',
                background: 'none',
                border: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer',
                fontFamily: 'Source Sans 3, sans-serif'
              }}
            >
              View detail →
            </button>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {metrics.dimensions.map(dim => (
                <div
                  key={dim.name}
                  onClick={() => handleDimensionBarClick(dim.name)}
                  style={{
                    cursor: 'pointer',
                    padding: '0.5rem',
                    margin: '-0.5rem',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0a1628',
                      fontFamily: 'Source Sans 3, sans-serif'
                    }}>
                      {dim.name}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      fontFamily: 'Source Sans 3, sans-serif'
                    }}>
                      {dim.total} criteria
                    </span>
                  </div>
                  <div style={{
                    height: '24px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex'
                  }}>
                    {dim.green > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDimensionBarClick(dim.name, 'green')
                        }}
                        style={{
                          width: `${dim.greenPercent}%`,
                          background: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'white',
                          minWidth: dim.green > 0 ? '24px' : '0',
                          fontFamily: 'Fraunces, Georgia, serif'
                        }}
                      >
                        {dim.green}
                      </div>
                    )}
                    {dim.amber > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDimensionBarClick(dim.name, 'amber')
                        }}
                        style={{
                          width: `${dim.amberPercent}%`,
                          background: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'white',
                          minWidth: dim.amber > 0 ? '24px' : '0',
                          fontFamily: 'Fraunces, Georgia, serif'
                        }}
                      >
                        {dim.amber}
                      </div>
                    )}
                    {dim.red > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDimensionBarClick(dim.name, 'red')
                        }}
                        style={{
                          width: `${dim.redPercent}%`,
                          background: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'white',
                          minWidth: dim.red > 0 ? '24px' : '0',
                          fontFamily: 'Fraunces, Georgia, serif'
                        }}
                      >
                        {dim.red}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div>
              <h3 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#0a1628'
              }}>
                Priority Actions
              </h3>
              <p style={{
                fontSize: '0.8rem',
                color: '#6b7280',
                marginTop: '0.15rem',
                fontFamily: 'Source Sans 3, sans-serif'
              }}>
                Critical items requiring attention
              </p>
            </div>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {metrics.priorityActions.map((action, index) => (
                <div
                  key={action.id}
                  onClick={() => onNavigateToDetail?.(action.id)}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '1.25rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${action.rating === 'RED' ? '#dc2626' : '#d97706'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#0a1628',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                    fontFamily: 'Fraunces, Georgia, serif'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.35rem'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#0a1628',
                        fontFamily: 'Source Sans 3, sans-serif'
                      }}>
                        {action.code}
                      </span>
                      {action.isCritical && (
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          background: 'rgba(220, 38, 38, 0.06)',
                          color: '#dc2626',
                          fontFamily: 'Source Sans 3, sans-serif'
                        }}>
                          Critical
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                        background: action.rating === 'RED' ? '#dc2626' : '#d97706',
                        color: 'white',
                        fontFamily: 'Source Sans 3, sans-serif'
                      }}>
                        {action.rating}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#0a1628',
                      marginBottom: '0.25rem',
                      fontFamily: 'Source Sans 3, sans-serif'
                    }}>
                      {action.title}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontFamily: 'Source Sans 3, sans-serif'
                    }}>
                      {action.description}
                    </div>
                  </div>
                  <div style={{
                    color: '#6b7280',
                    alignSelf: 'center'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Link */}
            <div style={{
              textAlign: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e5e7eb',
              marginTop: '0.75rem'
            }}>
              <button
                onClick={() => onNavigateToActions?.()}
                style={{
                  fontSize: '0.8rem',
                  color: '#0a1628',
                  background: 'none',
                  border: 'none',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  fontFamily: 'Source Sans 3, sans-serif'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c17f4e'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#0a1628'}
              >
                View all {totalPriorityActions} actions →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .dashboard-grid > *:nth-child(3) {
            grid-column: span 2;
          }
        }

        @media (max-width: 1024px) {
          .kpi-row {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .kpi-row {
            grid-template-columns: 1fr !important;
          }
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-grid > *:nth-child(3) {
            grid-column: span 1;
          }
        }

        .donut-segment:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}