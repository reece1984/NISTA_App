interface DocumentActivityItem {
  name: string
  description: string
  timestamp: string
  impact?: string
  impactType: 'positive' | 'pending' | 'neutral'
}

interface DocumentActivityProps {
  activities: DocumentActivityItem[]
  onViewAll?: () => void
}

export function DocumentActivity({ activities, onViewAll }: DocumentActivityProps) {
  const getBorderColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-500'
      case 'pending': return 'border-amber-400'
      default: return 'border-slate-300'
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50'
      case 'pending': return 'bg-slate-50'
      default: return 'bg-slate-50'
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100'
      case 'pending': return 'bg-slate-100'
      default: return 'bg-slate-100'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600'
      case 'pending': return 'text-slate-500'
      default: return 'text-slate-500'
    }
  }

  const getImpactColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600'
      case 'pending': return 'text-amber-600'
      default: return 'text-slate-600'
    }
  }

  return (
    <div className="col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-navy uppercase tracking-wide">Document Activity</h2>
          <p className="text-xs text-slate-400 mt-0.5">This week's changes</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-semibold text-green-700">Live sync</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
        {activities.map((activity, idx) => (
          <div
            key={idx}
            className={`flex gap-3 p-3 ${getBgColor(activity.impactType)} rounded-lg border-l-4 ${getBorderColor(activity.impactType)}`}
          >
            <div className={`w-8 h-8 rounded-lg ${getIconBg(activity.impactType)} flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-4 h-4 ${getIconColor(activity.impactType)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">{activity.name}</p>
              <p className="text-xs text-slate-500">{activity.description} · {activity.timestamp}</p>
              {activity.impact && (
                <p className={`text-xs font-semibold ${getImpactColor(activity.impactType)} mt-1`}>
                  {activity.impact}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onViewAll}
        className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-copper hover:text-copper-light font-medium py-2 transition-colors"
      >
        View all documents
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}
