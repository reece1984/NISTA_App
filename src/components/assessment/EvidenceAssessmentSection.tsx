import { EvidenceAssessmentCard } from './EvidenceAssessmentCard'
import type { EvidenceRequirement, EvidenceAssessmentItem } from '../../types/assessment'

interface Props {
  evidenceRequirements: EvidenceRequirement[]
  evidenceAssessment: EvidenceAssessmentItem[]
}

export function EvidenceAssessmentSection({ evidenceRequirements, evidenceAssessment }: Props) {
  // Merge requirements with assessment results
  const items = evidenceRequirements.map(req => {
    const assessment = evidenceAssessment.find(
      ea => ea.evidence_requirement_id === req.id
    )
    return {
      ...req,
      status: assessment?.status ?? 'missing',
      found_indicators: assessment?.found_indicators ?? [],
      missing_indicators: assessment?.missing_indicators ?? req.quality_indicators,
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
