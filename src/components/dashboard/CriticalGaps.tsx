interface CriticalGap {
  id: number
  title: string
  description: string
}

interface CriticalGapsProps {
  gaps: CriticalGap[]
  onGapClick?: (gapId: number) => void
  onGenerateContent?: () => void
}

export function CriticalGaps({ gaps, onGapClick, onGenerateContent }: CriticalGapsProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wide">Critical Gaps</h2>
        <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
          {gaps.length} blocker{gaps.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
        {gaps.slice(0, 5).map((gap) => (
          <button
            key={gap.id}
            onClick={() => onGapClick?.(gap.id)}
            className="w-full block p-3 bg-red-50 hover:bg-red-100 rounded-lg border-l-4 border-red-500 transition-colors group text-left"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-navy">
                  {gap.title}
                </p>
                <p className="text-xs text-slate-500">{gap.description}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-copper flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={onGenerateContent}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-navy hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Generate Missing Content
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">AI can draft content based on your documents</p>
      </div>
    </div>
  )
}
