interface ReadinessHeroProps {
  readinessPercent: number
  predictedRAG: 'GREEN' | 'AMBER' | 'RED'
  weeklyChange: number
  forecastDate: string
  daysAheadSchedule: number
}

export function ReadinessHero({
  readinessPercent,
  predictedRAG,
  weeklyChange,
  forecastDate,
  daysAheadSchedule
}: ReadinessHeroProps) {
  // Calculate stroke dash offset for circular progress
  const circumference = 2 * Math.PI * 52
  const strokeDashoffset = circumference - (readinessPercent / 100) * circumference

  // Gradient colors based on RAG status
  const gradientColors = {
    GREEN: { start: '#10b981', end: '#34d399' },
    AMBER: { start: '#f59e0b', end: '#fbbf24' },
    RED: { start: '#ef4444', end: '#f87171' }
  }

  const badgeColors = {
    GREEN: 'text-green-700 bg-green-100',
    AMBER: 'text-amber-700 bg-amber-100',
    RED: 'text-red-700 bg-red-100'
  }

  const isImproving = weeklyChange > 0

  return (
    <div className="col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold text-navy uppercase tracking-wide">Gateway Readiness</h2>
          <p className="text-xs text-slate-400 mt-0.5">Continuous assessment · Updated 2 hours ago</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeColors[predictedRAG]}`}>
          Predicted: {predictedRAG}
        </span>
      </div>

      <div className="flex items-center gap-8 mt-4">
        {/* Circular Progress */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10"/>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={`url(#${predictedRAG}Gradient)`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="GREENGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientColors.GREEN.start}/>
                <stop offset="100%" stopColor={gradientColors.GREEN.end}/>
              </linearGradient>
              <linearGradient id="AMBERGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientColors.AMBER.start}/>
                <stop offset="100%" stopColor={gradientColors.AMBER.end}/>
              </linearGradient>
              <linearGradient id="REDGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientColors.RED.start}/>
                <stop offset="100%" stopColor={gradientColors.RED.end}/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-navy">{readinessPercent}%</span>
            <span className="text-xs text-slate-400">Ready</span>
          </div>
        </div>

        {/* Trajectory Analysis */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isImproving ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-5 h-5 ${isImproving ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isImproving ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                )}
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${isImproving ? 'text-green-700' : 'text-red-700'}`}>
                {isImproving ? '+' : ''}{weeklyChange}% this week
              </p>
              <p className="text-xs text-slate-500">Trend: {isImproving ? 'Improving' : 'Declining'}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Trajectory Forecast</p>
            <p className="text-sm text-slate-700">
              At current pace, you'll reach <strong className="text-green-700">GREEN (85%+)</strong> by <strong className="text-navy">{forecastDate}</strong>
            </p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {daysAheadSchedule} days ahead of schedule
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
