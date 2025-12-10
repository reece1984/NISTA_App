import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  TrendingUp
} from 'lucide-react'
import type { ActionStats } from '../../types/actions'

interface ActionsSummaryProps {
  stats: ActionStats
}

export default function ActionsSummary({ stats }: ActionsSummaryProps) {
  return (
    <div className="grid grid-cols-6 gap-4 mb-6">
      {/* Total Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-navy">{stats.total}</p>
            <p className="text-xs text-slate-500 font-medium">Total Actions</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-amber-600">{stats.in_progress}</p>
            <p className="text-xs text-slate-500 font-medium">In Progress</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-slate-500 font-medium">Completed</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

      {/* Overdue */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-xs text-slate-500 font-medium">Overdue</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Blocked */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-purple-600">{stats.blocked}</p>
            <p className="text-xs text-slate-500 font-medium">Blocked</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Ban className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Potential Impact */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-copper">
              {stats.potential_impact > 0 ? `+${stats.potential_impact}%` : '0%'}
            </p>
            <p className="text-xs text-slate-500 font-medium">Potential Impact</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-copper" />
          </div>
        </div>
      </div>
    </div>
  )
}
