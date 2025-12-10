import { Search, Download } from 'lucide-react'
import type { ActionFilters } from '../../../types/actions'

interface ActionsFiltersProps {
  filters: ActionFilters
  onChange: (filters: Partial<ActionFilters>) => void
}

export default function ActionsFilters({ filters, onChange }: ActionsFiltersProps) {
  const handleClear = () => {
    onChange({
      status: 'all',
      priority: 'all',
      search: '',
      assignedTo: undefined
    })
  }

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.search ||
    filters.assignedTo

  return (
    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search actions..."
            value={filters.search || ''}
            onChange={e => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || 'all'}
          onChange={e => onChange({ status: e.target.value as any })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-copper/20"
        >
          <option value="all">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
          <option value="wont_fix">Won't Fix</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || 'all'}
          onChange={e => onChange({ priority: e.target.value as any })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-copper/20"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Owner Filter */}
        <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-copper/20">
          <option>All Owners</option>
          <option>Assigned to me</option>
          <option>Unassigned</option>
        </select>

        {/* Due Date Filter */}
        <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-copper/20">
          <option>Any Due Date</option>
          <option>Overdue</option>
          <option>Due Today</option>
          <option>Due This Week</option>
          <option>Due This Month</option>
        </select>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-sm text-slate-500 hover:text-copper transition-colors"
          >
            Clear
          </button>
        )}

        {/* Export Button */}
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
