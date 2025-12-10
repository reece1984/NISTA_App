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
  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'trajectory': return 'Trajectory Analysis'
      case 'risk': return 'Risk Alert'
      case 'opportunity': return 'Opportunity'
      default: return type
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 text-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold">AI Insights</h2>
      </div>

      {/* Insights list */}
      <div className="space-y-4 flex-1">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-4 bg-slate-700/50 rounded-lg">
            <h3 className={`text-sm font-semibold mb-2 ${
              insight.type === 'trajectory' ? 'text-green-400' :
              insight.type === 'risk' ? 'text-red-400' :
              'text-amber-400'
            }`}>
              {getInsightTitle(insight.type)}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {insight.content}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onAskAdvisor}
        className="mt-6 w-full bg-[#c2703e] hover:bg-[#a85d32] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Ask Gateway Advisor
      </button>
    </div>
  )
}
