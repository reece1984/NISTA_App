import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle, Info, CheckCircle, ClipboardList } from 'lucide-react'
import { DOCUMENT_GUIDANCE } from '../constants/documentGuidance'

interface DocumentGuidancePanelProps {
  templateCode: string | null
  templateName: string | null
}

export default function DocumentGuidancePanel({ templateCode, templateName }: DocumentGuidancePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!templateCode) {
    return (
      <div className="card bg-blue-50 border-l-4 border-secondary mb-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-text-secondary">
            Select an assessment template to see recommended documents for your project.
          </p>
        </div>
      </div>
    )
  }

  const guidance = DOCUMENT_GUIDANCE[templateCode]

  if (!guidance) {
    return null
  }

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-blue-100/50 border-l-4 border-secondary mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <ClipboardList size={20} className="text-secondary flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Recommended Documents for {templateName || guidance.title}
            </h3>
            <p className="text-sm text-text-secondary">{guidance.description}</p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          {isExpanded ? (
            <ChevronUp size={20} className="text-text-secondary" />
          ) : (
            <ChevronDown size={20} className="text-text-secondary" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Essential Documents */}
          {guidance.essential.length > 0 && (
            <div className="border-l-4 border-rag-amber pl-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-rag-amber" />
                <h4 className="font-semibold text-text-primary">
                  Essential Documents
                </h4>
                <span className="text-xs text-text-secondary">(Required for accurate assessment)</span>
              </div>
              <ul className="space-y-3">
                {guidance.essential.map((doc, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium text-text-primary">{doc.name}</div>
                    <div className="text-text-secondary">{doc.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Documents */}
          {guidance.recommended.length > 0 && (
            <div className="border-l-4 border-secondary pl-4">
              <div className="flex items-center gap-2 mb-3">
                <Info size={18} className="text-secondary" />
                <h4 className="font-semibold text-text-primary">
                  Recommended Documents
                </h4>
                <span className="text-xs text-text-secondary">(Improves assessment accuracy)</span>
              </div>
              <ul className="space-y-3">
                {guidance.recommended.map((doc, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium text-text-primary">{doc.name}</div>
                    <div className="text-text-secondary">{doc.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optional Documents */}
          {guidance.optional.length > 0 && (
            <div className="border-l-4 border-gray-300 pl-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-gray-500" />
                <h4 className="font-semibold text-text-primary">
                  Optional Documents
                </h4>
                <span className="text-xs text-text-secondary">(Provides additional context)</span>
              </div>
              <ul className="space-y-3">
                {guidance.optional.map((doc, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium text-text-primary">{doc.name}</div>
                    <div className="text-text-secondary">{doc.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-text-secondary italic">
              Don't have all documents? You can still run assessment with what you have. The more
              comprehensive your documentation, the more accurate your assessment will be.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
