interface CountdownTimerProps {
  daysRemaining: number
  targetDate: string
}

export function CountdownTimer({ daysRemaining, targetDate }: CountdownTimerProps) {
  return (
    <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-4">Time to Gate Review</h2>

      <div className="text-center">
        <div className="text-5xl font-bold text-navy mb-1">{daysRemaining}</div>
        <div className="text-sm text-slate-500 mb-4">days remaining</div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{targetDate}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Document freeze</span>
          <span className="font-medium text-amber-600">14 days before</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Pre-review meeting</span>
          <span className="font-medium text-slate-700">7 days before</span>
        </div>
      </div>
    </div>
  )
}
