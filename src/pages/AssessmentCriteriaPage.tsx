import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Search, ChevronDown, ChevronUp, LogOut, AlertCircle, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AssessmentTemplate } from '../lib/supabase'
import Button from '../components/ui/Button'

// Define the correct dimension order for UK government assessments
const DIMENSION_ORDER = ['Strategic', 'Economic', 'Commercial', 'Financial', 'Management']

interface AssessmentCriterion {
  id: number
  criterionCode: string
  dimension: string
  category: string
  title: string
  description: string
  assessmentQuestion: string
  weight: number | null
  is_critical: boolean
  template_id: number
}

export default function AssessmentCriteriaPage() {
  const { user, signOut } = useAuth()
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedDimensions, setSelectedDimensions] = useState<Set<string>>(new Set())
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'code' | 'title' | 'dimension'>('code')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .order('id')

      if (templatesError) throw templatesError
      setTemplates(templatesData || [])

      // Fetch all criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('assessment_criteria')
        .select('*')
        .order('criterionCode')

      if (criteriaError) throw criteriaError
      setCriteria(criteriaData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleDimension = (dimension: string) => {
    setSelectedDimensions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dimension)) {
        newSet.delete(dimension)
      } else {
        newSet.add(dimension)
      }
      return newSet
    })
  }

  // Filter and sort criteria
  const filteredCriteria = useMemo(() => {
    let result = criteria

    // Filter by template
    if (selectedTemplateId !== 'all') {
      result = result.filter((c) => c.template_id === selectedTemplateId)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.criterionCode.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.assessmentQuestion.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      )
    }

    // Filter by dimensions
    if (selectedDimensions.size > 0) {
      result = result.filter((c) => selectedDimensions.has(c.dimension))
    }

    // Filter by critical
    if (showCriticalOnly) {
      result = result.filter((c) => c.is_critical)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'code':
          return a.criterionCode.localeCompare(b.criterionCode, undefined, { numeric: true })
        case 'title':
          return a.title.localeCompare(b.title)
        case 'dimension': {
          const indexA = DIMENSION_ORDER.indexOf(a.dimension)
          const indexB = DIMENSION_ORDER.indexOf(b.dimension)
          // If dimension not found in order, put it at the end
          const orderA = indexA === -1 ? 999 : indexA
          const orderB = indexB === -1 ? 999 : indexB
          return orderA - orderB || a.criterionCode.localeCompare(b.criterionCode)
        }
        default:
          return 0
      }
    })

    return result
  }, [criteria, selectedTemplateId, searchQuery, selectedDimensions, showCriticalOnly, sortBy])

  // Calculate statistics
  const stats = useMemo(() => {
    const dimensionCounts: Record<string, number> = {}
    let criticalCount = 0
    let totalWeight = 0
    let weightCount = 0

    filteredCriteria.forEach((c) => {
      dimensionCounts[c.dimension] = (dimensionCounts[c.dimension] || 0) + 1
      if (c.is_critical) criticalCount++
      if (c.weight !== null) {
        totalWeight += c.weight
        weightCount++
      }
    })

    return {
      total: filteredCriteria.length,
      dimensionCounts,
      criticalCount,
      averageWeight: weightCount > 0 ? (totalWeight / weightCount).toFixed(1) : 'N/A',
    }
  }, [filteredCriteria])

  // Get unique dimensions in correct order
  const allDimensions = useMemo(() => {
    const uniqueDimensions = Array.from(new Set(criteria.map((c) => c.dimension)))
    return uniqueDimensions.sort((a, b) => {
      const indexA = DIMENSION_ORDER.indexOf(a)
      const indexB = DIMENSION_ORDER.indexOf(b)
      // If dimension not found in order, put it at the end
      const orderA = indexA === -1 ? 999 : indexA
      const orderB = indexB === -1 ? 999 : indexB
      return orderA - orderB
    })
  }, [criteria])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div>
                  <div className="text-xl font-semibold text-text-primary">Gateway Success</div>
                  <div className="text-xs text-text-secondary">NISTA/PAR Assessment</div>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/criteria"
                  className="text-sm text-secondary font-medium flex items-center gap-2"
                >
                  <ClipboardList size={16} />
                  Criteria
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary hidden sm:inline">{user?.email}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Assessment Criteria</h1>
          <p className="text-text-secondary">
            Review NISTA/PAR assessment criteria used across all templates
          </p>
        </div>

        {/* Search and Template Selector */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              size={20}
            />
            <input
              type="text"
              placeholder="Search criteria by code, title, or question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-border bg-card text-text-primary placeholder-text-secondary focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
            >
              <option value="all">All Templates ({criteria.length} criteria)</option>
              {templates.map((template) => {
                const count = criteria.filter((c) => c.template_id === template.id).length
                return (
                  <option key={template.id} value={template.id}>
                    {template.name} ({count} criteria)
                  </option>
                )
              })}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-gray-50">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Dimension Filters */}
              <div>
                <h3 className="font-semibold text-text-primary mb-3">Dimensions</h3>
                <div className="space-y-2">
                  {allDimensions.map((dimension) => (
                    <label key={dimension} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDimensions.has(dimension)}
                        onChange={() => toggleDimension(dimension)}
                        className="rounded border-gray-300 text-secondary focus:ring-secondary"
                      />
                      <span className="text-sm text-text-primary">{dimension}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Critical Filter */}
              <div>
                <h3 className="font-semibold text-text-primary mb-3">Critical Criteria</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCriticalOnly}
                    onChange={(e) => setShowCriticalOnly(e.target.checked)}
                    className="rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                  <span className="text-sm text-text-primary">Show only critical criteria</span>
                </label>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold text-text-primary mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="code">Criterion Code</option>
                  <option value="title">Title</option>
                  <option value="dimension">Dimension</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedDimensions(new Set())
                  setShowCriticalOnly(false)
                  setSortBy('code')
                  setSearchQuery('')
                }}
                className="text-sm text-secondary hover:text-secondary/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Statistics Panel */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-3xl font-bold text-text-primary">{stats.total}</div>
            <div className="text-sm text-text-secondary">Total Criteria</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-rag-red">{stats.criticalCount}</div>
            <div className="text-sm text-text-secondary">Critical</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-text-primary">{Object.keys(stats.dimensionCounts).length}</div>
            <div className="text-sm text-text-secondary">Dimensions</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-text-primary">{stats.averageWeight}%</div>
            <div className="text-sm text-text-secondary">Avg Weight</div>
          </div>
        </div>

        {/* Criteria List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-text-secondary">Loading criteria...</div>
          </div>
        ) : filteredCriteria.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">No criteria found matching your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedDimensions(new Set())
                setShowCriticalOnly(false)
                setSelectedTemplateId('all')
              }}
              className="mt-4 text-secondary hover:text-secondary/80 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCriteria.map((criterion) => {
              const isExpanded = expandedId === criterion.id

              return (
                <div key={criterion.id} className="card">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : criterion.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded">
                            {criterion.criterionCode}
                          </span>
                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-text-secondary">
                            {criterion.dimension}
                          </span>
                          {criterion.is_critical && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-rag-red/10 text-rag-red border border-rag-red/30">
                              <AlertCircle size={12} />
                              CRITICAL
                            </span>
                          )}
                          {criterion.weight !== null && (
                            <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded">
                              Weight: {criterion.weight}%
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-text-primary">
                          {criterion.title}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-text-secondary" />
                        ) : (
                          <ChevronDown size={20} className="text-text-secondary" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {/* Assessment Question */}
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-secondary">
                        <div className="text-xs font-semibold text-secondary uppercase mb-1">
                          Assessment Question
                        </div>
                        <p className="text-sm text-text-primary leading-relaxed italic">
                          {criterion.assessmentQuestion}
                        </p>
                      </div>

                      {/* Description */}
                      {criterion.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-text-primary mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {criterion.description}
                          </p>
                        </div>
                      )}

                      {/* Template Info */}
                      <div className="text-xs text-text-secondary">
                        Template:{' '}
                        {templates.find((t) => t.id === criterion.template_id)?.name || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
