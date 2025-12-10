import { RefreshCw, Check } from 'lucide-react'

const GENERATION_STEPS = [
  { label: 'Loaded assessment results', completed: true },
  { label: 'Identified RED/AMBER gaps', completed: true },
  { label: 'Generating remediation actions...', completed: false, active: true },
  { label: 'Calculating impact scores', completed: false },
  { label: 'Prioritizing actions', completed: false }
]

export default function SidebarLoadingState() {
  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-copper/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-copper animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Generating Actions</h2>
              <p className="text-xs text-white/50">Analyzing assessment gaps...</p>
            </div>
          </div>
          <button disabled className="p-2 text-white/30 cursor-not-allowed rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 border-b border-white/10">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/70">Progress</span>
            <span className="text-white font-medium">65%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-copper to-copper-light rounded-full transition-all duration-500"
              style={{ width: '65%' }}
            />
          </div>
        </div>

        {/* Status Steps */}
        <div className="space-y-3">
          {GENERATION_STEPS.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                step.completed
                  ? 'bg-green-500/20'
                  : step.active
                  ? 'bg-copper/30'
                  : 'bg-white/10'
              }`}>
                {step.completed ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : step.active ? (
                  <RefreshCw className="w-3 h-3 text-copper animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                )}
              </div>
              <span className={`text-sm ${
                step.active ? 'text-white' : step.completed ? 'text-white/70' : 'text-white/50'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton Action Cards */}
      <div className="flex-1 overflow-hidden p-6 space-y-3 relative">
        <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">
          Suggested Actions
        </p>

        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 w-16 rounded bg-slate-500" />
              <div className="h-5 w-10 rounded bg-slate-500" />
            </div>
            <div className="h-4 w-3/4 rounded bg-slate-500 mb-2" />
            <div className="h-3 w-full rounded bg-slate-500 mb-1" />
            <div className="h-3 w-2/3 rounded bg-slate-500" />
          </div>
        ))}

        {/* Fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-navy to-transparent pointer-events-none" />
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 bg-navy-light">
        <div className="flex items-center gap-3">
          <button
            disabled
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white/30 border border-white/10 rounded-lg cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            disabled
            className="flex-1 px-4 py-2.5 bg-white/10 text-white/30 text-sm font-medium rounded-lg cursor-not-allowed"
          >
            Generating...
          </button>
        </div>
      </div>
    </>
  )
}
