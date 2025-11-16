import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { n8nApi } from '../../services/n8nApi'
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AssessmentComparisonBannerProps {
  assessmentRunId: number
  projectId: number
  onGenerateActionPlan?: () => void
  onCloseActions?: (actionIds: number[]) => void
}

export default function AssessmentComparisonBanner({
  assessmentRunId,
  projectId,
  onGenerateActionPlan,
  onCloseActions
}: AssessmentComparisonBannerProps) {
  // Temporarily disabled to avoid CORS issues
  return null

  const [isDismissed, setIsDismissed] = useState(false)

  const { data: comparison, isLoading } = useQuery({
    queryKey: ['assessment-comparison', assessmentRunId],
    queryFn: () => n8nApi.compareAssessments(assessmentRunId, projectId),
    enabled: !!assessmentRunId && !!projectId,
    refetchOnWindowFocus: false
  })

  if (isLoading || !comparison || isDismissed) {
    return null
  }

  const { comparison: data } = comparison

  // Don't show banner if this is the first assessment
  if (!data.previousVersion) {
    return null
  }

  const isImproved = data.overallChange === 'IMPROVED'
  const isDeteriorated = data.overallChange === 'DETERIORATED'

  return (
    <div
      className={cn(
        'mb-8 rounded-xl border-2 p-6 shadow-lg',
        isImproved ? 'bg-green-50 border-green-300' : isDeteriorated ? 'bg-red-50 border-red-300' : 'bg-accent/5 border-accent/30'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {isImproved ? (
            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
              <TrendingUp size={24} className="text-white" />
            </div>
          ) : isDeteriorated ? (
            <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
              <TrendingDown size={24} className="text-white" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
              <Minus size={24} className="text-white" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isImproved ? '🎉 Assessment Improved!' : isDeteriorated ? '⚠️ Assessment Deteriorated' : 'Assessment Updated'}
            </h3>
            <p className="text-sm text-gray-600">
              Version {data.previousVersion} → Version {data.newVersion}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Overall Rating Change */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-lg font-semibold text-gray-700">Overall Rating:</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-3 py-1 rounded-lg font-bold',
              data.previousRag === 'GREEN' ? 'bg-green-500 text-white' :
              data.previousRag === 'AMBER' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            )}
          >
            {data.previousRag}
          </span>
          <span className="text-gray-400">→</span>
          <span
            className={cn(
              'px-3 py-1 rounded-lg font-bold',
              data.newRag === 'GREEN' ? 'bg-green-500 text-white' :
              data.newRag === 'AMBER' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            )}
          >
            {data.newRag}
          </span>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {/* Resolved */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">Resolved</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{data.summary.resolved}</div>
        </div>

        {/* Improved */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-accent" />
            <span className="text-sm text-gray-600">Improved</span>
          </div>
          <div className="text-2xl font-bold text-accent">{data.summary.improved}</div>
        </div>

        {/* Unchanged */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Minus size={16} className="text-gray-600" />
            <span className="text-sm text-gray-600">Unchanged</span>
          </div>
          <div className="text-2xl font-bold text-gray-600">{data.summary.unchanged}</div>
        </div>

        {/* Deteriorated */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Deteriorated</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{data.summary.deteriorated}</div>
        </div>

        {/* New Issues */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm text-gray-600">New Issues</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{data.summary.new}</div>
        </div>
      </div>

      {/* Action Suggestions */}
      <div className="flex flex-wrap items-center gap-3">
        {data.suggestedActions.closeActions && data.suggestedActions.closeActions.length > 0 && (
          <button
            onClick={() => onCloseActions?.(data.suggestedActions.closeActions)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <CheckCircle2 size={16} />
            Close {data.suggestedActions.closeActions.length} Resolved Action{data.suggestedActions.closeActions.length !== 1 ? 's' : ''}
          </button>
        )}

        {data.suggestedActions.generateNewActions && (
          <button
            onClick={onGenerateActionPlan}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
          >
            <Sparkles size={16} />
            Generate New Action Plan
          </button>
        )}
      </div>
    </div>
  )
}
