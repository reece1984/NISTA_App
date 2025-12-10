import { TrendingUp, Calendar, AlertCircle, ChevronDown, Zap } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import type { Action, ActionStatus, ActionPriority } from '../../../types/actions'

interface MetadataSidebarProps {
  action: Action
  onUpdate: (updates: Partial<Action>) => void
}

const caseCategoryLabels = {
  strategic: 'Strategic Case',
  economic: 'Economic Case',
  commercial: 'Commercial Case',
  financial: 'Financial Case',
  management: 'Management Case'
}

const caseCategoryColors = {
  strategic: 'bg-blue-400',
  economic: 'bg-green-400',
  commercial: 'bg-purple-400',
  financial: 'bg-amber-400',
  management: 'bg-red-400'
}

export default function MetadataSidebar({ action, onUpdate }: MetadataSidebarProps) {
  const isOverdue = action.due_date &&
    new Date(action.due_date) < new Date() &&
    !['completed', 'cancelled', 'wont_fix'].includes(action.action_status)

  const daysOverdue = isOverdue
    ? differenceInDays(new Date(), new Date(action.due_date!))
    : 0

  return (
    <div className="col-span-1 space-y-4">

      {/* Impact Score */}
      {action.estimated_impact && action.estimated_impact > 0 && (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
              Est. Impact
            </span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-700 mt-1">
            +{action.estimated_impact}%
          </p>
          <p className="text-xs text-green-600 mt-1">Readiness improvement</p>
        </div>
      )}

      {/* Status */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Status
        </label>
        <select
          value={action.action_status}
          onChange={e => onUpdate({ action_status: e.target.value as ActionStatus })}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
        >
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
          <option value="cancelled">Cancelled</option>
          <option value="wont_fix">Won't Fix</option>
        </select>
      </div>

      {/* Priority */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Priority
        </label>
        <select
          value={action.priority}
          onChange={e => onUpdate({ priority: e.target.value as ActionPriority })}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Owner */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Owner
        </label>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors text-left">
          <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-semibold">
            {action.assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN'}
          </div>
          <span className="flex-1 text-slate-700">
            {action.assignee?.name || 'Unassigned'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Due Date */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Due Date
        </label>
        {action.due_date ? (
          <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${
            isOverdue
              ? 'border-red-200 bg-red-50'
              : 'border-slate-200 bg-white'
          }`}>
            {isOverdue ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Calendar className="w-4 h-4 text-slate-500" />
            )}
            <div className="flex-1">
              <span className={`text-sm font-semibold ${isOverdue ? 'text-red-700' : 'text-slate-700'}`}>
                {format(new Date(action.due_date), 'MMM d, yyyy')}
              </span>
              {isOverdue && (
                <span className="text-xs text-red-600 ml-1">
                  ({daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue)
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">No due date</span>
          </div>
        )}
      </div>

      {/* Case Category */}
      {action.case_category && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Case
          </label>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${caseCategoryColors[action.case_category]}`} />
            <span className="text-sm text-slate-700">
              {caseCategoryLabels[action.case_category]}
            </span>
          </div>
        </div>
      )}

      {/* Source */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Source
        </label>
        <div className="flex items-center gap-2">
          {action.source_type === 'ai_generated' ? (
            <>
              <Zap className="w-4 h-4 text-copper" />
              <span className="text-sm text-slate-700">AI Generated</span>
              {action.source_assessment_run_id && (
                <span className="text-xs text-slate-400">
                  · Assessment v{action.source_assessment_run_id}
                </span>
              )}
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span className="text-sm text-slate-700">Manual Entry</span>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
