interface ActionItem {
  title: string
  dueDay: string
}

interface ActionPlanSummaryProps {
  completedCount: number
  inProgressCount: number
  notStartedCount: number
  overdueCount: number
  oldestOverdueDays: number
  dueThisWeek: ActionItem[]
  onManage?: () => void
}

export function ActionPlanSummary({
  completedCount,
  inProgressCount,
  notStartedCount,
  overdueCount,
  oldestOverdueDays,
  dueThisWeek,
  onManage
}: ActionPlanSummaryProps) {
  const totalCount = completedCount + inProgressCount + notStartedCount
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wide">Action Plan</h2>
        <button
          onClick={onManage}
          className="text-xs text-copper hover:text-copper-light font-medium transition-colors"
        >
          Manage →
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600">Completion</span>
          <span className="font-bold text-navy">{completedCount} of {totalCount}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-copper rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
          <div className="text-lg font-bold text-green-600">{completedCount}</div>
          <div className="text-[10px] font-semibold text-green-700">Complete</div>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
          <div className="text-lg font-bold text-amber-600">{inProgressCount}</div>
          <div className="text-[10px] font-semibold text-amber-700">In Progress</div>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-lg font-bold text-slate-500">{notStartedCount}</div>
          <div className="text-[10px] font-semibold text-slate-600">Not Started</div>
        </div>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2 mb-4">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p className="text-xs font-semibold text-red-700">{overdueCount} action{overdueCount !== 1 ? 's' : ''} overdue</p>
            <p className="text-[10px] text-red-600">Oldest: {oldestOverdueDays} days overdue</p>
          </div>
        </div>
      )}

      {/* Due this week */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Due this week</p>
        {dueThisWeek.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="flex-1 truncate text-slate-700">{item.title}</span>
            <span className="text-xs text-slate-400">{item.dueDay}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
