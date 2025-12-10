interface GatewayReadinessHeroProps {
  readinessPercent: number
  predictedRAG: 'GREEN' | 'AMBER' | 'RED'
  weeklyChange: number
  forecastDate: string
  daysAheadSchedule: number
  daysRemaining: number
  targetDate: string
}

export function GatewayReadinessHero({
  readinessPercent,
  predictedRAG,
  weeklyChange,
  forecastDate,
  daysAheadSchedule,
  daysRemaining,
  targetDate
}: GatewayReadinessHeroProps) {
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
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Gateway Readiness</h2>
          <p className="text-sm text-slate-500">Continuous assessment · Updated 2 hours ago</p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badgeColors[predictedRAG]}`}>
          Predicted: {predictedRAG}
        </span>
      </div>

      {/* Main content - two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Donut and trend */}
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
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
              <span className="text-3xl font-bold text-slate-900">{readinessPercent}%</span>
              <span className="text-sm text-slate-500">Ready</span>
            </div>
          </div>

          {/* Trend indicator */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isImproving ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`w-4 h-4 ${isImproving ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isImproving ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                  )}
                </svg>
              </div>
              <div>
                <span className={`text-lg font-semibold ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
                  {isImproving ? '+' : ''}{weeklyChange}% this week
                </span>
                <p className="text-sm text-slate-500">Trend: {isImproving ? 'Improving' : 'Declining'}</p>
              </div>
            </div>

            {/* Trajectory forecast */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Trajectory Forecast:</span> At current pace, you'll reach{' '}
                <span className="font-semibold text-green-600">GREEN (85%+)</span> by{' '}
                <span className="font-semibold">{forecastDate}</span>
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {daysAheadSchedule} days ahead of schedule
              </p>
            </div>
          </div>
        </div>

        {/* Right: Time to Gate Review */}
        <div className="border-l border-slate-200 pl-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Time to Gate Review
          </h3>

          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-slate-900">{daysRemaining}</span>
            <p className="text-sm text-slate-500 mt-1">days remaining</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>{targetDate}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Document freeze</span>
              <span className="font-medium text-amber-600">14 days before</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pre-review meeting</span>
              <span className="font-medium text-slate-900">7 days before</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
