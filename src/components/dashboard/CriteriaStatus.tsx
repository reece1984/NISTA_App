interface CriteriaStatusProps {
  greenCount: number
  amberCount: number
  redCount: number
  greenChange: number
  redChange: number
  onViewDetails?: () => void
}

export function CriteriaStatus({
  greenCount,
  amberCount,
  redCount,
  greenChange,
  redChange,
  onViewDetails
}: CriteriaStatusProps) {
  const total = greenCount + amberCount + redCount
  const greenPercent = (greenCount / total) * 100
  const amberPercent = (amberCount / total) * 100
  const redPercent = (redCount / total) * 100

  return (
    <div className="col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wide">Criteria Status</h2>
        <button
          onClick={onViewDetails}
          className="text-xs text-copper hover:text-copper-light font-medium transition-colors"
        >
          View details →
        </button>
      </div>

      {/* RAG Bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${greenPercent}%` }}
        />
        <div
          className="bg-amber-400 transition-all"
          style={{ width: `${amberPercent}%` }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${redPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
          <div className="text-2xl font-bold text-green-700">{greenCount}</div>
          <div className="text-xs text-green-600 font-medium">GREEN</div>
          {greenChange !== 0 && (
            <div className="text-[10px] text-green-500 mt-1 flex items-center justify-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
              +{greenChange} this week
            </div>
          )}
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
          <div className="text-2xl font-bold text-amber-700">{amberCount}</div>
          <div className="text-xs text-amber-600 font-medium">AMBER</div>
          <div className="text-[10px] text-slate-400 mt-1">no change</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
          <div className="text-2xl font-bold text-red-700">{redCount}</div>
          <div className="text-xs text-red-600 font-medium">RED</div>
          {redChange !== 0 && (
            <div className="text-[10px] text-green-500 mt-1 flex items-center justify-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
              -{Math.abs(redChange)} this week
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
