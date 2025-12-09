import type { EvidenceRequirement, EvidenceAssessmentItem } from '../../types/assessment'

interface Props {
  rating: 'GREEN' | 'AMBER' | 'RED'
  evidenceRequirements: EvidenceRequirement[]
  evidenceAssessment: EvidenceAssessmentItem[] | string | null | undefined
  greenStandard: string | any
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

export function PathToGreenSection({
  rating,
  evidenceRequirements,
  evidenceAssessment,
  greenStandard
}: Props) {
  // Don't show if already GREEN
  if (rating === 'GREEN') return null

  // Safely parse evidence assessment data
  const parsedAssessment = parseEvidenceAssessment(evidenceAssessment)

  // Safely convert greenStandard to string if it's an object
  const greenStandardText = typeof greenStandard === 'string'
    ? greenStandard
    : greenStandard?.definition || greenStandard?.text || JSON.stringify(greenStandard)

  // Collect all gaps
  const gaps: Array<{
    indicator: string
    evidenceText: string
    isMandatory: boolean
  }> = []

  evidenceRequirements.forEach(req => {
    const assessment = parsedAssessment.find(
      ea => ea.evidence_requirement_id === req.id
    )
    const rawMissingIndicators = assessment?.missing_indicators ?? req.quality_indicators

    // Normalize indicators to ensure they're strings (may contain objects from DB)
    const missingIndicators = Array.isArray(rawMissingIndicators)
      ? rawMissingIndicators
      : []

    missingIndicators.forEach(indicator => {
      // Safely convert any indicator to string
      let indicatorText = ''
      if (typeof indicator === 'string') {
        indicatorText = indicator
      } else if (indicator && typeof indicator === 'object') {
        indicatorText = indicator.definition || indicator.text || JSON.stringify(indicator)
      } else {
        indicatorText = String(indicator || '')
      }

      gaps.push({
        indicator: indicatorText,
        evidenceText: req.evidence_text,
        isMandatory: req.is_mandatory
      })
    })
  })

  if (gaps.length === 0) return null

  return (
    <>
      {/* Divider */}
      <div className="border-t border-slate-100 mx-6" />

      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            What's Needed for GREEN
          </h4>
          <span className="text-xs text-copper">
            {gaps.length} gap{gaps.length !== 1 ? 's' : ''} to address
          </span>
        </div>

        <div className="space-y-2 mb-5">
          {gaps.map((gap, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-copper rounded-full">
                {idx + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-800">{gap.indicator}</span>
                  {gap.isMandatory && (
                    <span className="text-xs text-red-500 font-medium">Required</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  via {gap.evidenceText}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="py-3 px-4 bg-green-50/70 rounded-lg border border-green-100">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">
            GREEN Standard
          </p>
          <p className="text-sm text-green-800">{greenStandardText}</p>
        </div>
      </div>
    </>
  )
}
