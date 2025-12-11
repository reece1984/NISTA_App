interface MetricsRowProps {
  readinessScore: number
  greenCount: number
  amberCount: number
  redCount: number
  daysToGate: number | null
}

export default function MetricsRow({
  readinessScore,
  greenCount,
  amberCount,
  redCount,
  daysToGate
}: MetricsRowProps) {
  const getRatingColor = () => {
    if (readinessScore >= 85) return '#16a34a' // green-600
    if (readinessScore >= 50) return '#f59e0b' // amber-500
    return '#dc2626' // red-600
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Overall Readiness */}
      <div className="border border-slate-200 rounded-lg p-4 text-center">
        <div className="text-4xl font-bold text-slate-900">{readinessScore}%</div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">Gateway Readiness</div>
        {/* Small colored bar matching rating */}
        <div className="h-1 mt-2 rounded-full" style={{ backgroundColor: getRatingColor() }} />
      </div>

      {/* GREEN Count */}
      <div className="border border-slate-200 rounded-lg p-4 text-center">
        <div className="text-4xl font-bold" style={{ color: '#16a34a' }}>{greenCount}</div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">Complete</div>
      </div>

      {/* AMBER Count */}
      <div className="border border-slate-200 rounded-lg p-4 text-center">
        <div className="text-4xl font-bold" style={{ color: '#f59e0b' }}>{amberCount}</div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">In Progress</div>
      </div>

      {/* RED Count */}
      <div className="border border-slate-200 rounded-lg p-4 text-center">
        <div className="text-4xl font-bold text-slate-700">{redCount}</div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">To Address</div>
      </div>

      {/* Days to Gate */}
      <div className="border border-slate-200 rounded-lg p-4 text-center">
        <div className="text-4xl font-bold text-slate-900">{daysToGate ?? '—'}</div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mt-1">Days to Gate</div>
      </div>
    </div>
  )
}
