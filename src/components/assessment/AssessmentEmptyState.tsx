import { Upload, Play, FileText, CheckCircle2, AlertCircle, Lightbulb, HelpCircle } from 'lucide-react'

interface EmptyStateProps {
  variant: 'no-documents' | 'ready-to-assess' | 'in-progress' | 'not-assessed'
  documentCount?: number
  progress?: { current: number; total: number }
  onUpload?: () => void
  onRunAssessment?: () => void
}

export function AssessmentEmptyState({
  variant,
  documentCount,
  progress,
  onUpload,
  onRunAssessment,
}: EmptyStateProps) {
  // No Documents State
  if (variant === 'no-documents') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-16 text-center">
          {/* Warning style icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-amber-100/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 flex items-center justify-center shadow-sm">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-navy mb-2">No Documents Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Upload your project documents first. The AI needs business cases, strategic outlines, and supporting materials to assess against gateway criteria.
          </p>

          {/* Suggested documents */}
          <div className="inline-flex flex-col items-start gap-2 px-5 py-4 bg-slate-50 rounded-xl text-left mb-8">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Recommended documents
            </span>
            <div className="flex flex-wrap gap-2">
              {['Strategic Outline Case', 'Full Business Case', 'Benefits Register', 'Risk Register'].map((doc) => (
                <span
                  key={doc}
                  className="px-2.5 py-1 text-xs text-slate-600 bg-white rounded-md border border-slate-200"
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Documents
          </button>
        </div>
      </div>
    )
  }

  // Ready to Assess State (has documents but no assessment)
  if (variant === 'ready-to-assess') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-16 text-center">
          {/* Animated Icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-green-100/50 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-green-50/50" />
            <div className="absolute inset-0 flex items-center justify-center animate-bounce-slow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-navy mb-2">Documents Ready</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Your project documents have been uploaded and processed. Run an assessment to analyse them against IPA gateway criteria.
          </p>

          {/* Document count badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg mb-8">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              <strong className="font-semibold">{documentCount} document{documentCount !== 1 ? 's' : ''}</strong> uploaded
            </span>
          </div>

          {/* CTA */}
          <div>
            <button
              onClick={onRunAssessment}
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy hover:bg-slate-800 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!progress}
            >
              <Play className="w-5 h-5" />
              Run Assessment
            </button>
            <p className="text-xs text-slate-400 mt-3">Takes approximately 2-3 minutes</p>
          </div>

          {/* Progress Bar - shown when assessment is running */}
          {progress && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-copper flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assessing criteria...
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {progress.current} of {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.round((progress.current / progress.total) * 100)}%`,
                        background: 'linear-gradient(90deg, #c2703e 0%, #d4a574 100%)'
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  {Math.round((progress.current / progress.total) * 100)}% complete • This may take 2-5 minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Assessment In Progress State
  if (variant === 'in-progress') {
    const percentage = progress ? (progress.current / progress.total) * 100 : 0

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-16 text-center">
          {/* Animated spinner icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-copper border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Lightbulb className="w-7 h-7 text-copper" />
              </div>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-navy mb-2">Assessment in Progress</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Analysing your documents against {progress?.total || 47} gateway criteria. This typically takes 2-3 minutes.
          </p>

          {/* Progress indicator */}
          {progress && (
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Assessing criteria...</span>
                <span className="font-medium text-copper">
                  {progress.current} of {progress.total}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-copper to-copper-light rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Not Yet Assessed State (for individual criterion)
  if (variant === 'not-assessed') {
    return (
      <div className="px-8 py-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-100 flex items-center justify-center">
          <HelpCircle className="w-7 h-7 text-slate-400" />
        </div>

        <h4 className="text-base font-medium text-slate-700 mb-1">Not Yet Assessed</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Run an assessment to see the AI analysis, evidence found, and recommendations for this criterion.
        </p>

        <button
          onClick={onRunAssessment}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Play className="w-4 h-4" />
          Run Assessment
        </button>
      </div>
    )
  }

  return null
}
