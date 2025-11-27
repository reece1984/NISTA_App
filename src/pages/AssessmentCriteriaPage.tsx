import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, LogOut, FileText, ExternalLink } from 'lucide-react'
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

  // Mock stats - in real app these would come from assessment_runs data
  const stats = {
    total: criteria.length,
    assessed: 4,
    green: 2,
    amber: 1,
    red: 1,
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-text-accent">Loading...</div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-text-primary mb-2">Gate Review Criteria</h1>
                <p className="text-text-accent">
                  Assessment criteria for {selectedTemplate?.name || 'Gate Review'}
                </p>
              </div>

              {/* Gate Selector Buttons */}
              <div className="flex items-center gap-2">
                {templates.map((template) => {
                  // Check if template is PAR or Gate X
                  const isPAR = template.name.toLowerCase().includes('par')
                  const gateNum = template.name.match(/Gate (\d+)/)?.[1] || '0'
                  const displayLabel = isPAR ? 'PAR' : `G${gateNum}`

                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTemplateId === template.id
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'bg-white text-text-accent hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {displayLabel}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* PDF Reference Card - Only show for Gate templates, not PAR */}
            {pdfUrl && (
              <div className="mb-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-6 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                        <FileText size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">
                        IPA {gateName} Review Workbook
                      </h2>
                      <p className="text-white/70 text-sm">
                        Official guidance document containing detailed evidence requirements for each criterion
                      </p>
                    </div>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded font-semibold text-sm hover:bg-white/90 transition-colors flex-shrink-0"
                  >
                    View PDF
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-8 pt-4 border-t border-white/20">
                  <div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <div className="text-sm text-white/60">Total Criteria</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{stats.assessed}</div>
                    <div className="text-sm text-white/60">Assessed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">{stats.green}</div>
                    <div className="text-sm text-white/60">Green Rating</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-400">{stats.amber}</div>
                    <div className="text-sm text-white/60">Amber Rating</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-400">{stats.red}</div>
                    <div className="text-sm text-white/60">Red Rating</div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Accordion */}
            <div className="space-y-4">
              {groupedCriteria.map((group) => {
                const isExpanded = expandedCategories.has(group.category)
                const categoryColor = CATEGORY_COLORS[group.category] || 'bg-gray-500'
                const assessedCount = 2 // Mock - would come from real data

                // Mock RAG status for display
                const ragStatuses = group.criteria.map((_, idx) => {
                  if (idx < 2) return 'green'
                  if (idx < 3) return 'amber'
                  return 'gray'
                })

                return (
                  <div
                    key={group.category}
                    ref={(el) => (categoryRefs.current[group.category] = el)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(group.category)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Colored accent bar */}
                        <div className={`w-1.5 h-10 rounded-full ${categoryColor}`}></div>

                        <div className="flex flex-col gap-1 flex-1">
                          <h3 className="text-lg font-bold text-text-primary">
                            {group.category}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {assessedCount} of {group.criteria.length} criteria assessed
                          </span>
                        </div>

                        {/* Mini RAG dots */}
                        <div className="flex items-center gap-1.5">
                          {ragStatuses.map((status, idx) => (
                            <div
                              key={idx}
                              className={`w-2.5 h-2.5 rounded-full ${
                                status === 'green'
                                  ? 'bg-green-500'
                                  : status === 'amber'
                                  ? 'bg-amber-500'
                                  : 'bg-gray-300'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Chevron */}
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400 ml-4" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400 ml-4" />
                      )}
                    </button>

                    {/* Expanded Criteria Rows */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {group.criteria.map((criterion, idx) => {
                          const pageRef = criterion.page_ref || 15 + idx // Mock page ref
                          // Mock status based on index
                          const status = idx < 2 ? 'Assessed' : idx < 3 ? 'In Progress' : 'Not Started'
                          const ragStatus = idx < 2 ? (idx === 0 ? 'green' : 'amber') : 'gray'

                          return (
                            <div
                              key={criterion.id}
                              className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-4"
                            >
                              {/* Criterion ID */}
                              <span className="font-semibold text-sm text-text-primary flex-shrink-0 min-w-[50px]">
                                {criterion.criterion_code}
                              </span>

                              {/* Question text */}
                              <p className="text-sm text-text-primary flex-1 leading-relaxed">
                                {criterion.assessment_question}
                              </p>

                              {/* Status badge */}
                              <span
                                className={`px-3 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                                  status === 'Assessed'
                                    ? 'bg-slate-800 text-white'
                                    : status === 'In Progress'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {status}
                              </span>

                              {/* Page reference link - Only show for Gate templates, not PAR */}
                              {pdfUrl && (
                                <a
                                  href={`${pdfUrl}#page=${pageRef}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0 transition-colors"
                                >
                                  p.{pageRef}
                                  <ExternalLink size={12} />
                                </a>
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
