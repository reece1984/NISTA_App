import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ClipboardList, Search, ChevronDown, ChevronUp, LogOut, AlertCircle, Filter, BookOpen, ArrowRight } from 'lucide-react'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedDimensions, setSelectedDimensions] = useState<Set<string>>(new Set())
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'code' | 'title' | 'dimension'>('code')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Handle URL query params for deep linking
  useEffect(() => {
    const templateParam = searchParams.get('template')
    if (templateParam && templates.length > 0) {
      const template = templates.find((t) => t.id === Number(templateParam))
      if (template) {
        setSelectedTemplateId(template.id)
      }
    }
  }, [searchParams, templates])

  // Fetch criteria when template is selected
  useEffect(() => {
    if (selectedTemplateId) {
      fetchCriteriaForTemplate(selectedTemplateId)
    } else {
      setCriteria([])
    }
  }, [selectedTemplateId])

  const fetchTemplates = async () => {
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
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCriteriaForTemplate = async (templateId: number) => {
    try {
      // Fetch criteria for selected template only
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('assessment_criteria')
        .select('*')
        .eq('template_id', templateId)
        .order('criterion_code')

      if (criteriaError) throw criteriaError
      setCriteria(criteriaData || [])
    } catch (error) {
      console.error('Error fetching criteria:', error)
    }
  }

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId)
    setSearchParams({ template: templateId.toString() })
    // Reset filters when changing template
    setSearchQuery('')
    setSelectedDimensions(new Set())
    setShowCriticalOnly(false)
    setExpandedId(null)
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

  // Filter and sort criteria (criteria is already filtered by selected template)
  const filteredCriteria = useMemo(() => {
    let result = criteria

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary border-b border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div>
                  <div className="text-xl font-semibold text-white">Gateway Success</div>
                  <div className="text-xs text-white/70">NISTA/PAR Assessment</div>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-sm text-white/85 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/criteria"
                  className="text-sm text-white font-medium flex items-center gap-2 border-b-2 border-accent"
                >
                  <ClipboardList size={16} />
                  Criteria
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70 hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/85 hover:text-white px-3 py-2 rounded-lg font-medium text-sm transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Assessment Criteria</h1>
          <p className="text-text-accent">
            {selectedTemplateId
              ? templates.find((t) => t.id === selectedTemplateId)?.name || 'Review NISTA/PAR criteria for your assessment'
              : 'Review NISTA/PAR criteria for your assessment'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-text-accent">Loading templates...</div>
          </div>
        ) : !selectedTemplateId ? (
          /* INITIAL STATE - NO TEMPLATE SELECTED */
          <>
            {/* About NISTA/PAR Section */}
            <div className="mb-12 card bg-gradient-to-br from-accent/5 to-accent/10 border-l-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <BookOpen size={24} className="text-accent" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">
                    About NISTA/PAR Assessment Framework
                  </h2>
                  <div className="space-y-4 text-text-accent leading-relaxed">
                    <p>
                      The <strong>NISTA (New Infrastructure Strategic Transparency Assessment)</strong> and{' '}
                      <strong>PAR (Project Assessment Review)</strong> frameworks are used by the Infrastructure and
                      Projects Authority (IPA) to assess major UK government projects.
                    </p>
                    <p>Assessments are structured around five cases:</p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-text-primary mt-0.5">•</span>
                        <span>
                          <strong className="text-text-primary">Strategic Case</strong> - Strategic fit and alignment
                          with government priorities
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-text-primary mt-0.5">•</span>
                        <span>
                          <strong className="text-text-primary">Economic Case</strong> - Value for money and
                          cost-benefit analysis
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-text-primary mt-0.5">•</span>
                        <span>
                          <strong className="text-text-primary">Commercial Case</strong> - Procurement strategy and
                          contract approach
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-text-primary mt-0.5">•</span>
                        <span>
                          <strong className="text-text-primary">Financial Case</strong> - Affordability and funding
                          arrangements
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold text-text-primary mt-0.5">•</span>
                        <span>
                          <strong className="text-text-primary">Management Case</strong> - Deliverability and governance
                        </span>
                      </li>
                    </ul>
                    <p className="pt-2">
                      Gateway Success uses these official criteria to assess your project documentation before formal
                      IPA review, helping you identify gaps early.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Selection Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
                Select Assessment Template
              </h2>
              <p className="text-text-accent text-center mb-8">
                Choose a template to view its assessment criteria
              </p>

              {/* Template Cards Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="card text-left hover:shadow-lg hover:border-accent transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                        {template.name}
                      </h3>
                      <ArrowRight
                        size={24}
                        className="text-text-accent group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0"
                      />
                    </div>
                    {template.description && (
                      <p className="text-text-accent mb-4 leading-relaxed">{template.description}</p>
                    )}
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <div className="text-sm">
                        <span className="font-semibold text-text-primary">View Criteria</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* TEMPLATE SELECTED STATE */
          <>
            {/* Template Selector Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-accent mb-2">Template:</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(Number(e.target.value))}
                className="w-full md:w-auto min-w-[300px] px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors text-text-primary font-medium"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-accent"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search criteria by code, title, or question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-border bg-card text-text-primary placeholder-text-accent focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Filters Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
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
                            className="rounded border-gray-300 text-accent focus:ring-accent"
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
                        className="rounded border-gray-300 text-accent focus:ring-accent"
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
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
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
                    className="text-sm text-accent hover:text-accent/80 transition-colors"
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
                <div className="text-sm text-text-accent">Total Criteria</div>
              </div>
              <div className="card">
                <div className="text-3xl font-bold text-rag-red">{stats.criticalCount}</div>
                <div className="text-sm text-text-accent">Critical</div>
              </div>
              <div className="card">
                <div className="text-3xl font-bold text-text-primary">{Object.keys(stats.dimensionCounts).length}</div>
                <div className="text-sm text-text-accent">Dimensions</div>
              </div>
              <div className="card">
                <div className="text-3xl font-bold text-text-primary">{stats.averageWeight}%</div>
                <div className="text-sm text-text-accent">Avg Weight</div>
              </div>
            </div>

            {/* Criteria List */}
            {filteredCriteria.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-text-accent">No criteria found matching your filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDimensions(new Set())
                    setShowCriticalOnly(false)
                  }}
                  className="mt-4 text-accent hover:text-accent/80 font-medium"
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
                              <span className="font-mono text-sm font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                                {criterion.criterionCode}
                              </span>
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-text-accent">
                                {criterion.dimension}
                              </span>
                              {criterion.is_critical && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-rag-red/10 text-rag-red border border-rag-red/30">
                                  <AlertCircle size={12} />
                                  CRITICAL
                                </span>
                              )}
                              {criterion.weight !== null && (
                                <span className="text-xs font-medium text-text-accent bg-gray-100 px-2 py-1 rounded">
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
                              <ChevronUp size={20} className="text-text-accent" />
                            ) : (
                              <ChevronDown size={20} className="text-text-accent" />
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          {/* Assessment Question */}
                          <div className="p-3 bg-accent/5 rounded-lg border-l-4 border-accent">
                            <div className="text-xs font-semibold text-accent uppercase mb-1">
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
                              <p className="text-sm text-text-accent leading-relaxed">
                                {criterion.description}
                              </p>
                            </div>
                          )}

                          {/* Template Info */}
                          <div className="text-xs text-text-accent">
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
          </>
        )}
      </main>
    </div>
  )
}
