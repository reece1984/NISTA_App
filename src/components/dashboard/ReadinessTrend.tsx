import { useState } from 'react'

type TimePeriod = '4W' | '8W' | '12W'

interface ReadinessTrendProps {
  // Placeholder for now - will be replaced with real data later
}

export function ReadinessTrend({}: ReadinessTrendProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('8W')

  // Placeholder data points
  const dataPoints = [
    { week: 'Nov 4', value: 30 },
    { week: 'Nov 11', value: 35 },
    { week: 'Nov 18', value: 40 },
    { week: 'Nov 25', value: 48 },
    { week: 'Dec 2', value: 55 },
    { week: 'Dec 9', value: 67 }
  ]

  const projectedPoints = [
    { week: 'Dec 16', value: 78 },
    { week: 'Dec 23', value: 88 }
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-navy uppercase tracking-wide">Readiness Trend</h2>
          <p className="text-xs text-slate-400 mt-0.5">Weekly progress toward GREEN threshold</p>
        </div>
        <div className="flex items-center gap-2">
          {(['4W', '8W', '12W'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timePeriod === period
                  ? 'text-white bg-navy'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Chart */}
        <div className="ml-12 h-40 relative">
          {/* GREEN threshold line */}
          <div className="absolute left-0 right-0 top-[15%] border-t-2 border-dashed border-green-300 z-10">
            <span className="absolute -top-2.5 right-0 text-[10px] font-medium text-green-600 bg-white px-1">
              GREEN (85%)
            </span>
          </div>

          {/* SVG Chart */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Projected trend area */}
            <polygon
              points="400,80 480,65 560,48 560,160 400,160"
              fill="url(#projectedGradient)"
              opacity="0.3"
            />
            {/* Actual trend line */}
            <polyline
              points="0,140 80,130 160,120 240,105 320,90 400,80"
              fill="none"
              stroke="#c2703e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Projected trend line */}
            <polyline
              points="400,80 480,65 560,48"
              fill="none"
              stroke="#c2703e"
              strokeWidth="3"
              strokeDasharray="8,4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
            {/* Data points */}
            <circle cx="0" cy="140" r="4" fill="#c2703e"/>
            <circle cx="80" cy="130" r="4" fill="#c2703e"/>
            <circle cx="160" cy="120" r="4" fill="#c2703e"/>
            <circle cx="240" cy="105" r="4" fill="#c2703e"/>
            <circle cx="320" cy="90" r="4" fill="#c2703e"/>
            <circle cx="400" cy="80" r="6" fill="#c2703e" stroke="white" strokeWidth="2"/>

            <defs>
              <linearGradient id="projectedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c2703e" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#c2703e" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 -mb-6">
            {dataPoints.map((point) => (
              <span key={point.week}>{point.week}</span>
            ))}
            {projectedPoints.map((point) => (
              <span key={point.week} className="text-slate-300">{point.week}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-copper rounded" />
          <span className="text-slate-600">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-0.5 rounded"
            style={{
              background: 'repeating-linear-gradient(90deg, #c2703e 0, #c2703e 4px, transparent 4px, transparent 8px)'
            }}
          />
          <span className="text-slate-600">Projected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-green-400" />
          <span className="text-slate-600">GREEN threshold</span>
        </div>
      </div>
    </div>
  )
}
