import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, ExternalLink, AlertTriangle, X, ClipboardList, ShieldAlert, Search, ChevronDown } from 'lucide-react'
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
  criticalCount: number
  blockerCount: number
}

// Five Case Model order - MUST be in this sequence
const CASE_ORDER = ['Strategic', 'Economic', 'Commercial', 'Financial', 'Management']

// Case colors for visual distinction
const CASE_COLORS: Record<string, string> = {
  'Strategic': 'bg-blue-500',
  'Economic': 'bg-emerald-500',
  'Commercial': 'bg-purple-500',
  'Financial': 'bg-amber-500',
  'Management': 'bg-slate-500',
}

export default function AssessmentCriteriaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [caseFilter, setCaseFilter] = useState('all')
  const [importanceFilter, setImportanceFilter] = useState('all')

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
        setSelectedTemplateId(templates[0].id)
      }
    } else if (selectedTemplateId === null) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [searchParams, templates])

  useEffect(() => {
    if (selectedTemplateId) {
      fetchCriteria(selectedTemplateId)
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

  // Filter criteria
  const filteredCriteria = criteria.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.assessment_question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.criterion_code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCase = caseFilter === 'all' || c.category === caseFilter

    const matchesImportance =
      importanceFilter === 'all' ||
      (importanceFilter === 'critical' && c.is_critical && !c.is_gateway_blocker) ||
      (importanceFilter === 'blocker' && c.is_gateway_blocker)

    return matchesSearch && matchesCase && matchesImportance
  })

  // Group criteria by category with counts
  const groupedCriteria: CategoryGroup[] = filteredCriteria.reduce((acc: CategoryGroup[], criterion) => {
    const existing = acc.find(g => g.category === criterion.category)
    if (existing) {
      existing.criteria.push(criterion)
      if (criterion.is_critical && !criterion.is_gateway_blocker) existing.criticalCount++
      if (criterion.is_gateway_blocker) existing.blockerCount++
    } else {
      acc.push({
        category: criterion.category,
        criteria: [criterion],
        criticalCount: (criterion.is_critical && !criterion.is_gateway_blocker) ? 1 : 0,
        blockerCount: criterion.is_gateway_blocker ? 1 : 0
      })
    }
    return acc
  }, [])

  // Sort by Five Case Model order
  const sortedCriteria = groupedCriteria.sort((a, b) => {
    const indexA = CASE_ORDER.indexOf(a.category)
    const indexB = CASE_ORDER.indexOf(b.category)

    // If not in the standard order, put at end
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
  const gateName = selectedTemplate?.name || 'Gate 0'
  const isPAR = gateName.toLowerCase().includes('par')
  const gateNumber = gateName.match(/Gate (\d+)/)?.[1] || '0'

  // Calculate stats
  const stats = {
    total: filteredCriteria.length,
    critical: filteredCriteria.filter(c => c.is_critical && !c.is_gateway_blocker).length,
    blockers: filteredCriteria.filter(c => c.is_gateway_blocker).length
  }

  const pdfUrl = isPAR ? null : `/documents/IPA_Gate_Review_Process_-_Gate_${gateNumber}.pdf`

  return (
    <div className="px-8 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header with Gate Tabs */}
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gate Review Criteria</h1>
          <p className="text-sm text-slate-500 mt-1">
            Assessment criteria for {selectedTemplate?.name || 'Gate Review'}
          </p>
        </div>

        {/* Gate Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
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
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {displayLabel}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-600">Loading criteria...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Total Criteria */}
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-500">Total Criteria</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </div>

            {/* Critical */}
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                  <p className="text-sm text-slate-500">Critical</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            {/* Gateway Blockers */}
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-600">{stats.blockers}</p>
                  <p className="text-sm text-slate-500">Gateway Blockers</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Source Document Card */}
          {pdfUrl && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    IPA {selectedTemplate?.name} Review Workbook
                  </p>
                  <p className="text-sm text-slate-500">
                    Official guidance document with detailed evidence requirements
                  </p>
                </div>
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-copper hover:text-[#a85d32] transition-colors"
              >
                View PDF
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search criteria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
                />
              </div>

              {/* Filter by Case */}
              <select
                value={caseFilter}
                onChange={(e) => setCaseFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
              >
                <option value="all">All Cases</option>
                {CASE_ORDER.map(caseName => (
                  <option key={caseName} value={caseName}>{caseName}</option>
                ))}
              </select>

              {/* Filter by Importance */}
              <select
                value={importanceFilter}
                onChange={(e) => setImportanceFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
              >
                <option value="all">All Criteria</option>
                <option value="critical">Critical Only</option>
                <option value="blocker">Gateway Blockers</option>
              </select>
            </div>
          </div>

          {/* Criteria List by Case */}
          <div className="space-y-4">
            {sortedCriteria.map(group => {
              const isExpanded = expandedCategories.has(group.category)
              const colorClass = CASE_COLORS[group.category] || 'bg-slate-500'

              return (
                <div
                  key={group.category}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                >
                  {/* Case Header */}
                  <button
                    onClick={() => toggleCategory(group.category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${colorClass}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-slate-900">{group.category}</h3>
                        <p className="text-sm text-slate-500">{group.criteria.length} criteria</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Critical count */}
                      {group.criticalCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          {group.criticalCount} critical
                        </span>
                      )}
                      {/* Blocker count */}
                      {group.blockerCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          {group.blockerCount} blockers
                        </span>
                      )}

                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Criteria List */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {group.criteria.map((criterion, index) => {
                        const isCritical = criterion.is_critical && !criterion.is_gateway_blocker
                        const isBlocker = criterion.is_gateway_blocker

                        return (
                          <div
                            key={criterion.id}
                            className={`flex items-start gap-3 py-2.5 px-4 ${
                              index !== group.criteria.length - 1 ? 'border-b border-slate-100' : ''
                            } hover:bg-slate-50 transition-colors`}
                          >
                            {/* Criterion Code */}
                            <span className="text-sm font-mono text-slate-400 w-20 flex-shrink-0">
                              {criterion.criterion_code}
                            </span>

                            {/* Criterion Question */}
                            <div className="flex-1">
                              <p className="text-sm text-slate-700 leading-snug">{criterion.assessment_question}</p>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isCritical && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                  CRITICAL
                                </span>
                              )}
                              {isBlocker && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                                  BLOCKER
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {sortedCriteria.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <p className="text-slate-600">No criteria match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCaseFilter('all')
                  setImportanceFilter('all')
                }}
                className="mt-4 text-sm text-copper hover:text-[#a85d32] font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}
