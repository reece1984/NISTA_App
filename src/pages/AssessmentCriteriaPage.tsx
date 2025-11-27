import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, LogOut, FileText, ExternalLink, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AssessmentTemplate } from '../lib/supabase'

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  Strategic: 'border-blue-500',
  Governance: 'border-purple-500',
  Economic: 'border-green-500',
  Commercial: 'border-orange-500',
  Financial: 'border-yellow-500',
  Management: 'border-pink-500',
}

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  Strategic: 'text-blue-600',
  Governance: 'text-purple-600',
  Economic: 'text-green-600',
  Commercial: 'text-orange-600',
  Financial: 'text-yellow-600',
  Management: 'text-pink-600',
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
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

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

      // Expand first category by default
      if (criteriaData && criteriaData.length > 0) {
        setExpandedCategories(new Set([criteriaData[0].dimension]))
      }
    } catch (error) {
      console.error('Error fetching criteria:', error)
    }
  }

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
  const gateNumber = gateName.match(/Gate (\d+)/)?.[1] || '0'

  // Mock stats - in real app these would come from assessment_runs data
  const stats = {
    total: criteria.length,
    assessed: 0,
    green: 0,
    amber: 0,
    red: 0,
  }

  const pdfUrl = `/documents/IPA_Gate_Review_Process_-_Gate_${gateNumber}.pdf`

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
                  Dashboard
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
                  const gateNum = template.name.match(/Gate (\d+)/)?.[1] || '0'
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTemplateId === template.id
                          ? 'bg-accent text-white shadow-md'
                          : 'bg-white text-text-accent hover:bg-gray-100 border border-border'
                      }`}
                    >
                      G{gateNum}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* PDF Reference Card */}
            <div className="mb-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <FileText size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">
                    IPA {gateName} Review Workbook
                  </h2>
                  <p className="text-white/70 text-sm mb-4">
                    Official guidance document containing detailed evidence requirements for each criterion
                  </p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    <FileText size={16} />
                    View PDF
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Stats Row */}
                <div className="hidden md:flex items-center gap-6 ml-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-white/60">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.assessed}</div>
                    <div className="text-xs text-white/60">Assessed</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-rag-green"></div>
                      <span className="text-sm font-semibold">{stats.green}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-rag-amber"></div>
                      <span className="text-sm font-semibold">{stats.amber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-rag-red"></div>
                      <span className="text-sm font-semibold">{stats.red}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Accordion */}
            <div className="space-y-3">
              {groupedCriteria.map((group) => {
                const isExpanded = expandedCategories.has(group.category)
                const categoryColor = CATEGORY_COLORS[group.category] || 'border-gray-500'
                const categoryTextColor = CATEGORY_TEXT_COLORS[group.category] || 'text-gray-600'
                const assessedCount = 0 // Mock - would come from real data

                return (
                  <div key={group.category} className="bg-white rounded-lg shadow-sm overflow-hidden border border-border">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(group.category)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Colored accent bar */}
                        <div className={`w-1 h-12 rounded-full ${categoryColor}`}></div>

                        <div className="flex items-center gap-3 flex-1">
                          <h3 className={`text-lg font-bold ${categoryTextColor}`}>
                            {group.category}
                          </h3>
                          <span className="text-sm text-text-accent">
                            {assessedCount} of {group.criteria.length} criteria assessed
                          </span>
                        </div>

                        {/* Mini RAG dots - placeholder */}
                        <div className="flex items-center gap-1">
                          {group.criteria.slice(0, Math.min(5, group.criteria.length)).map((_, idx) => (
                            <div key={idx} className="w-2 h-2 rounded-full bg-gray-300"></div>
                          ))}
                          {group.criteria.length > 5 && (
                            <span className="text-xs text-text-accent ml-1">+{group.criteria.length - 5}</span>
                          )}
                        </div>
                      </div>

                      {/* Chevron */}
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-text-accent ml-4" />
                      ) : (
                        <ChevronDown size={20} className="text-text-accent ml-4" />
                      )}
                    </button>

                    {/* Expanded Criteria Rows */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {group.criteria.map((criterion) => {
                          const categoryTextColor = CATEGORY_TEXT_COLORS[group.category] || 'text-gray-600'
                          const pageRef = criterion.page_ref || Math.floor(Math.random() * 50) + 1 // Mock page ref
                          const status = 'Not Started' // Mock status

                          return (
                            <div
                              key={criterion.id}
                              className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-border last:border-b-0 flex items-center gap-4"
                            >
                              {/* Rating dot */}
                              <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0"></div>

                              {/* Criterion ID */}
                              <span className={`font-mono text-sm font-bold ${categoryTextColor} flex-shrink-0 min-w-[60px]`}>
                                {criterion.criterion_code}
                              </span>

                              {/* Question text */}
                              <p className="text-sm text-text-primary flex-1 leading-relaxed">
                                {criterion.assessment_question}
                              </p>

                              {/* Status badge */}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                                  status === 'Assessed'
                                    ? 'bg-slate-700 text-white'
                                    : status === 'In Progress'
                                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                    : 'bg-gray-100 text-text-accent'
                                }`}
                              >
                                {status}
                              </span>

                              {/* Page reference link */}
                              <a
                                href={`${pdfUrl}#page=${pageRef}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 font-medium flex-shrink-0 transition-colors"
                              >
                                p.{pageRef}
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Help Tip */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <strong>Need evidence details?</strong> Click the page reference (p.XX) next to any criterion to jump directly to the evidence requirements in the official IPA guidance document.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
