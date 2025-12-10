import { ChevronDown, ChevronUp, Plus, AlertCircle } from 'lucide-react'

interface EvidenceRequirement {
  id: number
  description: string
  is_met: boolean
}

interface Gap {
  id?: number
  description: string
  is_required?: boolean
}

interface Criterion {
  id: number
  code?: string
  criterion_code?: string
  title: string
  rag_rating: string
  finding?: string
  satisfaction?: number
  confidence?: number
  weight?: number
  is_critical?: boolean
  evidence_requirements?: EvidenceRequirement[]
  gaps?: Gap[]
  green_standard?: string
  recommendation?: string
  assessment_criteria?: {
    criterion_code: string
    title: string
    is_critical: boolean
    green_standard?: string
  }
}

interface CriterionRowProps {
  criterion: Criterion
  isExpanded: boolean
  onToggle: () => void
  onCreateAction?: (criterion: Criterion) => void
}

export function CriterionRow({ criterion, isExpanded, onToggle, onCreateAction }: CriterionRowProps) {
  const code = criterion.code || criterion.criterion_code || criterion.assessment_criteria?.criterion_code || 'N/A'
  const title = criterion.title || criterion.assessment_criteria?.title || 'Untitled Criterion'
  const rating = criterion.rag_rating?.toUpperCase() || 'AMBER'
  const isCritical = criterion.is_critical || criterion.assessment_criteria?.is_critical || false
  const greenStandard = criterion.green_standard || criterion.assessment_criteria?.green_standard

  const ratingStyles = {
    GREEN: 'bg-green-100 text-green-700 border-green-200',
    AMBER: 'bg-amber-100 text-amber-700 border-amber-200',
    RED: 'bg-red-100 text-red-700 border-red-200',
  }

  // Calculate satisfaction, confidence, weight with defaults
  const satisfaction = criterion.satisfaction ?? 50
  const confidence = criterion.confidence ?? 50
  const weight = criterion.weight ?? 1.0

  return (
    <div
      id={`criterion-${criterion.id}`}
      className="border border-slate-200 rounded-lg overflow-hidden"
    >
      {/* Row header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 w-16">{code}</span>
          <span className="text-sm font-medium text-slate-900">{title}</span>
          {isCritical && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
              CRITICAL
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Confidence indicator */}
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>

          {/* Rating badge */}
          <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${ratingStyles[rating as keyof typeof ratingStyles] || ratingStyles.AMBER}`}>
            {rating}
          </span>

          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{satisfaction}%</p>
              <p className="text-xs text-slate-500 uppercase">Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{confidence}</p>
              <p className="text-xs text-slate-500 uppercase">Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{weight}%</p>
              <p className="text-xs text-slate-500 uppercase">Weight</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${isCritical ? 'text-red-600' : 'text-slate-400'}`}>
                {isCritical ? 'Yes' : 'No'}
              </p>
              <p className="text-xs text-slate-500 uppercase">Critical</p>
            </div>
          </div>

          {/* Finding */}
          {criterion.finding && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Finding</h5>
              <p className="text-sm text-slate-700 leading-relaxed">{criterion.finding}</p>
            </div>
          )}

          {/* Evidence requirements */}
          {criterion.evidence_requirements && criterion.evidence_requirements.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Evidence Requirements
              </h5>
              <div className="space-y-2">
                {criterion.evidence_requirements.map((req) => (
                  <div key={req.id} className="flex items-start justify-between gap-3 p-2 bg-white rounded border border-slate-200">
                    <span className="text-sm text-slate-700 flex-1">{req.description}</span>
                    <span className={`text-xs font-medium flex-shrink-0 ${req.is_met ? 'text-green-600' : 'text-red-600'}`}>
                      {req.is_met ? 'Met' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's needed for GREEN */}
          {criterion.gaps && criterion.gaps.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  What's Needed for GREEN
                </h5>
                <span className="text-xs text-green-600 font-medium">
                  {criterion.gaps.length} gaps to address
                </span>
              </div>
              <div className="space-y-1">
                {criterion.gaps.map((gap, index) => (
                  <div key={gap.id || index} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700">{gap.description}</span>
                    {gap.is_required && (
                      <span className="text-xs text-red-600 font-medium">Required</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GREEN standard */}
          {greenStandard && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                GREEN Standard
              </h5>
              <p className="text-sm text-green-800">{greenStandard}</p>
            </div>
          )}

          {/* Recommendation / Action required */}
          {criterion.recommendation && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                      Action Required
                    </h5>
                    <p className="text-sm text-slate-700">{criterion.recommendation}</p>
                  </div>
                </div>
                {onCreateAction && (
                  <button
                    onClick={() => onCreateAction(criterion)}
                    className="flex-shrink-0 bg-copper hover:bg-[#a85d32] text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Create Action
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
