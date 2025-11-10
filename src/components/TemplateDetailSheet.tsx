import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Sheet from './ui/Sheet'

// Define the correct dimension order for UK government assessments
const DIMENSION_ORDER = ['Strategic', 'Economic', 'Commercial', 'Financial', 'Management']

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
}

interface DimensionGroup {
  dimension: string
  criteria: AssessmentCriterion[]
}

interface TemplateDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  templateId: number | null
  templateName: string
}

export default function TemplateDetailSheet({
  isOpen,
  onClose,
  templateId,
  templateName,
}: TemplateDetailSheetProps) {
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && templateId) {
      fetchCriteria()
    }
  }, [isOpen, templateId])

  const fetchCriteria = async () => {
    if (!templateId) return

    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('assessment_criteria')
        .select(
          'id, criterion_code, dimension, category, title, description, assessment_question, weight, is_critical'
        )
        .eq('template_id', templateId)
        .order('criterion_code')

      if (fetchError) throw fetchError

      setCriteria(data || [])
      // Expand first dimension by default
      if (data && data.length > 0) {
        setExpandedDimensions(new Set([data[0].dimension]))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load criteria')
    } finally {
      setLoading(false)
    }
  }

  const groupedCriteria: DimensionGroup[] = criteria
    .reduce((groups, criterion) => {
      const existingGroup = groups.find((g) => g.dimension === criterion.dimension)
      if (existingGroup) {
        existingGroup.criteria.push(criterion)
      } else {
        groups.push({ dimension: criterion.dimension, criteria: [criterion] })
      }
      return groups
    }, [] as DimensionGroup[])
    .sort((a, b) => {
      const indexA = DIMENSION_ORDER.indexOf(a.dimension)
      const indexB = DIMENSION_ORDER.indexOf(b.dimension)
      // If dimension not found in order, put it at the end
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

  const toggleDimension = (dimension: string) => {
    setExpandedDimensions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dimension)) {
        newSet.delete(dimension)
      } else {
        newSet.add(dimension)
      }
      return newSet
    })
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={templateName}
      size="lg"
    >
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-text-secondary">Loading criteria...</div>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary */}
          <div className="mb-6 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {criteria.length}
                </div>
                <div className="text-sm text-text-secondary">
                  Criteria Assessed
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {groupedCriteria.length}
                </div>
                <div className="text-sm text-text-secondary">Dimensions</div>
              </div>
            </div>
          </div>

          {/* Grouped Criteria */}
          <div className="space-y-4">
            {groupedCriteria.map((group) => {
              const isExpanded = expandedDimensions.has(group.dimension)
              const criticalCount = group.criteria.filter((c) => c.is_critical).length

              return (
                <div key={group.dimension} className="border border-border rounded-lg overflow-hidden">
                  {/* Dimension Header */}
                  <button
                    onClick={() => toggleDimension(group.dimension)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {group.dimension}
                      </h3>
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary">
                        {group.criteria.length} {group.criteria.length === 1 ? 'criterion' : 'criteria'}
                      </span>
                      {criticalCount > 0 && (
                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-rag-red/10 text-rag-red border border-rag-red/30 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {criticalCount} critical
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-text-secondary" />
                    ) : (
                      <ChevronDown size={20} className="text-text-secondary" />
                    )}
                  </button>

                  {/* Criteria List */}
                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {group.criteria.map((criterion) => (
                        <div key={criterion.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                          {/* Criterion Header */}
                          <div className="flex items-start gap-3 mb-2">
                            <span className="font-mono text-xs font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded flex-shrink-0">
                              {criterion.criterion_code}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-text-primary mb-1">
                                {criterion.title}
                              </h4>
                              {criterion.is_critical && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rag-red/10 text-rag-red border border-rag-red/30 mb-2">
                                  <AlertCircle size={12} />
                                  CRITICAL
                                </span>
                              )}
                            </div>
                            {criterion.weight !== null && (
                              <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                                Weight: {criterion.weight}%
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {criterion.description && (
                            <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                              {criterion.description}
                            </p>
                          )}

                          {/* Assessment Question */}
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-secondary">
                            <div className="text-xs font-semibold text-secondary uppercase mb-1">
                              Assessment Question
                            </div>
                            <p className="text-sm text-text-primary leading-relaxed italic">
                              {criterion.assessment_question}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {criteria.length === 0 && !loading && (
            <div className="text-center py-12 text-text-secondary">
              No criteria found for this template.
            </div>
          )}
        </>
      )}
    </Sheet>
  )
}
