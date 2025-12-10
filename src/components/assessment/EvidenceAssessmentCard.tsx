import { Check, X } from 'lucide-react'
import type { EvidenceRequirement, EvidenceAssessmentItem } from '../../types/assessment'

interface Props {
  item: EvidenceRequirement & {
    status: 'found' | 'partial' | 'missing'
    found_indicators: string[]
    missing_indicators: string[]
    source_refs: Array<{ doc: string; page: number }>
  }
}

export function EvidenceAssessmentCard({ item }: Props) {
  const statusConfig = {
    found: {
      borderColor: 'border-l-green-500',
      badgeColor: 'bg-green-50 text-green-700 border-green-200',
      dotColor: 'bg-green-500',
      label: 'Found'
    },
    partial: {
      borderColor: 'border-l-amber-500',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
      label: 'Partial'
    },
    missing: {
      borderColor: 'border-l-slate-300',
      badgeColor: 'bg-slate-50 text-slate-500 border-slate-200',
      dotColor: 'bg-slate-400',
      label: 'Missing'
    }
  }

  const config = statusConfig[item.status]

  return (
    <div className={`rounded-lg border border-slate-200 bg-white overflow-hidden border-l-4 ${config.borderColor}`}>
      <div className="flex items-start gap-4 p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-800">
              {item.evidence_text}
            </span>
            {item.is_mandatory && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-500 bg-slate-100 rounded font-medium">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Expected in: {item.document_types.join(', ')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.found_indicators.map((indicator, i) => {
              // Safely convert any indicator to string
              let indicatorText = ''
              if (typeof indicator === 'string') {
                indicatorText = indicator
              } else if (indicator && typeof indicator === 'object') {
                indicatorText = indicator.definition || indicator.text || JSON.stringify(indicator)
              } else {
                indicatorText = String(indicator || '')
              }

              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-green-700 bg-green-50 rounded-md"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {indicatorText}
                </span>
              )
            })}
            {item.missing_indicators.map((indicator, i) => {
              // Safely convert any indicator to string
              let indicatorText = ''
              if (typeof indicator === 'string') {
                indicatorText = indicator
              } else if (indicator && typeof indicator === 'object') {
                indicatorText = indicator.definition || indicator.text || JSON.stringify(indicator)
              } else {
                indicatorText = String(indicator || '')
              }

              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-slate-500 bg-slate-50 rounded-md border border-slate-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                  {indicatorText}
                </span>
              )
            })}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.badgeColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
          {config.label}
        </span>
      </div>
    </div>
  )
}
