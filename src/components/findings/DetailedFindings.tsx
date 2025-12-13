import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { CaseSection } from './CaseSection'

interface Criterion {
  id: number
  code?: string
  criterion_code?: string
  title: string
  rag_rating: string
  category?: string
  finding?: string
  satisfaction?: number
  confidence?: number
  weight?: number
  is_critical?: boolean
  evidence_requirements?: any[]
  gaps?: any[]
  green_standard?: string
  recommendation?: string
  assessment_criteria?: {
    category?: string
    code?: string
    title?: string
    is_critical?: boolean
    green_standard?: string
  }
}

interface DetailedFindingsProps {
  assessments: Criterion[]
  expandedCriteria: number[]
  setExpandedCriteria: (ids: number[]) => void
  onCreateAction?: (context: {
    criterionId: number
    criterionCode: string
    criterionTitle: string
    caseCategory: string
    finding: string
    recommendation: string
    ragRating: string
  }) => void
}

type FilterType = 'all' | 'green' | 'amber' | 'red' | 'critical'

export function DetailedFindings({
  assessments,
  expandedCriteria,
  setExpandedCriteria,
  onCreateAction
}: DetailedFindingsProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const filteredCriteria = useMemo(() => {
    return assessments.filter(c => {
      if (filter === 'all') return true
      if (filter === 'critical') {
        const isCritical = c.is_critical || c.assessment_criteria?.is_critical
        return isCritical
      }
      return c.rag_rating?.toLowerCase() === filter
    })
  }, [assessments, filter])

  // Group by case category
  const groupedByCases = useMemo(() => {
    const groups: Record<string, Criterion[]> = {}

    filteredCriteria.forEach(criterion => {
      const category = criterion.category || criterion.assessment_criteria?.category || 'General'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(criterion)
    })

    return groups
  }, [filteredCriteria])

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6">
      {/* Header - always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
          <h2 className="text-base font-semibold text-slate-900">Detailed Findings</h2>
        </div>
        <span className="text-sm text-slate-500">
          {isCollapsed ? 'Expand' : 'Collapse'}
        </span>
      </button>

      {/* Collapsible content */}
      {!isCollapsed && (
        <>
          {/* Filter bar */}
          <div className="px-4 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(['all', 'green', 'amber', 'red', 'critical'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filter === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all' ? 'All' :
                     f === 'critical' ? 'Critical Only' :
                     f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <span className="text-sm text-slate-500">
                Showing {filteredCriteria.length} of {assessments.length} criteria
              </span>
            </div>
          </div>

          {/* Case sections */}
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedByCases).length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No criteria match the selected filter
              </div>
            ) : (
              Object.entries(groupedByCases).map(([caseCategory, criteria]) => (
                <CaseSection
                  key={caseCategory}
                  caseCategory={caseCategory}
                  criteria={criteria}
                  expandedCriteria={expandedCriteria}
                  setExpandedCriteria={setExpandedCriteria}
                  onCreateAction={onCreateAction}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
