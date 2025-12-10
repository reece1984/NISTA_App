import { EvidenceAssessmentCard } from './EvidenceAssessmentCard'
import type { EvidenceRequirement, EvidenceAssessmentItem } from '../../types/assessment'

interface Props {
  evidenceRequirements: EvidenceRequirement[]
  evidenceAssessment: EvidenceAssessmentItem[] | string | null | undefined
}

/**
 * Safely parse evidence_assessment data which may be:
 * - JSON string (from database)
 * - Already parsed array
 * - null/undefined
 */
const parseEvidenceAssessment = (data: string | any[] | null | undefined): EvidenceAssessmentItem[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * Normalize indicators array which may contain:
 * - Strings: ["indicator1", "indicator2"]
 * - Objects: [{definition: "...", indicators: [...]}, ...]
 */
const normalizeIndicators = (indicators: any[] | undefined | null): string[] => {
  if (!indicators || !Array.isArray(indicators)) return []

  return indicators.map(indicator => {
    if (typeof indicator === 'string') {
      return indicator
    }
    if (indicator && typeof indicator === 'object') {
      return indicator.definition || indicator.text || JSON.stringify(indicator)
    }
    return String(indicator || '')
  })
}

export function EvidenceAssessmentSection({ evidenceRequirements, evidenceAssessment }: Props) {
  // Safely parse evidence assessment data
  const safeEvidenceAssessment = parseEvidenceAssessment(evidenceAssessment)

  // Merge requirements with assessment results
  const items = evidenceRequirements.map(req => {
    const assessment = safeEvidenceAssessment.find(
      ea => ea.evidence_requirement_id === req.id
    )
    return {
      ...req,
      status: assessment?.status ?? 'missing',
      found_indicators: normalizeIndicators(assessment?.found_indicators),
      missing_indicators: assessment?.missing_indicators
        ? normalizeIndicators(assessment.missing_indicators)
        : normalizeIndicators(req.quality_indicators),
      source_refs: assessment?.source_refs ?? []
    }
  })

  const stats = {
    found: items.filter(i => i.status === 'found').length,
    partial: items.filter(i => i.status === 'partial').length,
    missing: items.filter(i => i.status === 'missing').length
  }

  return (
    <div className="px-6 pb-6 pt-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Evidence Assessment
        </h4>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {stats.found} found
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {stats.partial} partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {stats.missing} missing
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <EvidenceAssessmentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
