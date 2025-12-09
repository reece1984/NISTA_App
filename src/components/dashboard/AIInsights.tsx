interface Insight {
  type: 'trajectory' | 'risk' | 'opportunity'
  title: string
  content: string
}

interface AIInsightsProps {
  insights: Insight[]
  onAskAdvisor?: () => void
}

export function AIInsights({ insights, onAskAdvisor }: AIInsightsProps) {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trajectory': return 'text-copper'
      case 'risk': return 'text-amber-400'
      case 'opportunity': return 'text-green-400'
      default: return 'text-copper'
    }
  }

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'trajectory': return 'Trajectory Analysis'
      case 'risk': return 'Risk Alert'
      case 'opportunity': return 'Opportunity'
      default: return type
    }
  }

  return (
    <div className="col-span-4 bg-gradient-to-br from-navy to-slate-800 rounded-2xl p-6 shadow-sm text-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-copper/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/80">AI Insights</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-3 bg-white/10 rounded-lg backdrop-blur">
            <p className={`text-xs font-medium mb-1 ${getInsightColor(insight.type)}`}>
              {getInsightTitle(insight.type)}
            </p>
            <p className="text-sm text-white/90">{insight.content}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onAskAdvisor}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-copper hover:bg-copper-light text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Ask Gateway Advisor
      </button>
    </div>
  )
}
