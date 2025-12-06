import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, LogOut, FileText, ExternalLink, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AssessmentTemplate } from '../lib/supabase'

// Category colors - matching the screenshot
const CATEGORY_COLORS: Record<string, string> = {
  Strategic: 'bg-blue-500',
  Governance: 'bg-purple-500',
  Economic: 'bg-green-500',
  Commercial: 'bg-orange-500',
  Financial: 'bg-yellow-500',
  Management: 'bg-pink-500',
}

// Category text colors for criterion IDs
const CATEGORY_TEXT_COLORS: Record<string, string> = {
  Strategic: 'text-blue-500',
  Governance: 'text-purple-500',
  Economic: 'text-green-500',
  Commercial: 'text-orange-500',
  Financial: 'text-yellow-500',
  Management: 'text-pink-500',
}

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
  page_ref?: number // PDF page reference
}

interface CategoryGroup {
  category: string
  criteria: AssessmentCriterion[]
}

export default function AssessmentCriteriaPage() {
  const { user, signOut } = useAuth()
  const [searchParams] = useSearchParams()
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    fetchTemplates()
  }, [])

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
      const { data: templatesData, error: templatesError } = await supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .order('id')

      if (templatesError) throw templatesError
      setTemplates(templatesData || [])

      // Auto-select first template
      if (templatesData && templatesData.length > 0) {
        setSelectedTemplateId(templatesData[0].id)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCriteriaForTemplate = async (templateId: number) => {
    try {
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('assessment_criteria')
        .select('*')
        .eq('template_id', templateId)
        .order('criterion_code')

      if (criteriaError) throw criteriaError
      setCriteria(criteriaData || [])

      // Handle URL parameter for category
      const categoryParam = searchParams.get('category')

      if (categoryParam && criteriaData && criteriaData.length > 0) {
        // If category param exists, only expand that category
        setExpandedCategories(new Set([categoryParam]))
      } else {
        // Otherwise expand all categories by default
        if (criteriaData && criteriaData.length > 0) {
          const allCategories = new Set(criteriaData.map(c => c.dimension))
          setExpandedCategories(allCategories)
        }
      }
    } catch (error) {
      console.error('Error fetching criteria:', error)
    }
  }

  // Scroll to category when URL param changes
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && categoryRefs.current[categoryParam]) {
      // Small delay to ensure the category is expanded and rendered
      setTimeout(() => {
        categoryRefs.current[categoryParam]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }, [searchParams, criteria])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
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
  const groupedCriteria: CategoryGroup[] = useMemo(() => {
    const groups: Record<string, AssessmentCriterion[]> = {}

    criteria.forEach((criterion) => {
      const category = criterion.dimension || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(criterion)
    })

    return Object.entries(groups).map(([category, criteria]) => ({
      category,
      criteria,
    }))
  }, [criteria])

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
  const gateName = selectedTemplate?.name || 'Gate 0'
  const isPAR = gateName.toLowerCase().includes('par')
  const gateNumber = gateName.match(/Gate (\d+)/)?.[1] || '0'

  // Calculate stats from actual criteria data
  const stats = {
    total: criteria.length,
    critical: criteria.filter(c => c.is_critical || c.is_gateway_blocker).length,
  }

  // PAR template doesn't have a PDF, only Gate templates do
  const pdfUrl = isPAR ? null : `/documents/IPA_Gate_Review_Process_-_Gate_${gateNumber}.pdf`

  return (
    <div className="min-h-screen bg-gray-50">
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
                  Projects
                </Link>
                <Link
                  to="/criteria"
                  className="text-sm text-white font-medium border-b-2 border-accent"
                >
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

      {/* Page Header - WHITE background, separate from the dark card */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Gate Review Criteria</h1>
              <p className="text-slate-600 mt-1">Assessment criteria for {selectedTemplate?.name || 'Gate Review'}</p>
            </div>

            {/* Gate Selector */}
            <div className="flex items-center gap-2">
              {templates.map((template) => {
                // Check if template is PAR or Gate X
                const templateNameLower = template.name.toLowerCase()
                const templateCodeLower = template.code?.toLowerCase() || ''
                const isPAR = templateNameLower.includes('par') || templateCodeLower === 'par' || templateNameLower.includes('project assessment review')

                let displayLabel = 'G0'
                if (isPAR) {
                  displayLabel = 'PAR'
                } else {
                  const gateNum = template.name.match(/Gate (\d+)/)?.[1]
                  if (gateNum) {
                    displayLabel = `G${gateNum}`
                  }
                }

                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedTemplateId === template.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {displayLabel}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - grey background */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-text-accent">Loading...</div>
          </div>
        ) : (
          <>
            {/* PDF Reference Card - DARK slate, sits inside the grey content area */}
            {pdfUrl && (
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-5 mb-8 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">IPA {gateName} Review Workbook</h3>
                      <p className="text-slate-300 text-sm mt-1">
                        Official guidance document containing detailed evidence requirements for each criterion
                      </p>
                    </div>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
                  >
                    View PDF
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Stats Row */}
                <div className="flex gap-8 mt-6 pt-5 border-t border-white/20">
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-slate-300 text-sm">Total Criteria</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400">{stats.critical}</div>
                    <div className="text-orange-400 text-sm">Critical Criteria</div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Accordion */}
            <div className="space-y-4">
              {groupedCriteria.map((group) => {
                const isExpanded = expandedCategories.has(group.category)
                const categoryColor = CATEGORY_COLORS[group.category] || 'bg-gray-500'
                const categoryTextColor = CATEGORY_TEXT_COLORS[group.category] || 'text-gray-700'
                const criticalCount = group.criteria.filter(c => c.is_critical || c.is_gateway_blocker).length

                return (
                  <div
                    key={group.category}
                    ref={(el) => (categoryRefs.current[group.category] = el)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(group.category)}
                      className="w-full px-6 py-4 flex items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Colored accent bar */}
                        <div className={`w-1.5 h-10 rounded-full ${categoryColor}`}></div>

                        <div className="flex flex-col gap-1 items-start flex-1">
                          <h3 className="text-lg font-bold text-text-primary">
                            {group.category}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {group.criteria.length} criteria{criticalCount > 0 && ` • ${criticalCount} critical`}
                          </span>
                        </div>
                      </div>

                      {/* Chevron */}
                      <div className="flex items-center gap-4 ml-auto">
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Criteria Rows */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {group.criteria.map((criterion) => {
                          const isCritical = criterion.is_critical || criterion.is_gateway_blocker

                          return (
                            <div
                              key={criterion.id}
                              className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-4"
                            >
                              {/* Criterion ID - colored to match category */}
                              <span className={`font-semibold text-sm ${categoryTextColor} flex-shrink-0 min-w-[50px]`}>
                                {criterion.criterion_code}
                              </span>

                              {/* Question text */}
                              <p className="text-sm text-text-primary flex-1 leading-relaxed">
                                {criterion.assessment_question}
                              </p>

                              {/* Critical badge - Only show if criterion is critical or gateway blocker */}
                              {isCritical && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
                                  <AlertTriangle size={12} />
                                  Critical
                                </span>
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
          </>
        )}
      </main>
    </div>
  )
}
