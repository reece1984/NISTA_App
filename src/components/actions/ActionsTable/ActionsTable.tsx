import { ChevronDown } from 'lucide-react'
import ActionRow from './ActionRow'
import type { Action } from '../../../types/actions'

interface ActionsTableProps {
  actions: Action[]
  isLoading: boolean
  selectedIds: Set<number>
  onSelectAll: () => void
  onSelectOne: (id: number) => void
  onOpenDetail: (action: Action) => void
}

export default function ActionsTable({
  actions,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onOpenDetail
}: ActionsTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-copper rounded-full animate-spin" />
        <p className="mt-3 text-sm">Loading actions...</p>
      </div>
    )
  }

  if (actions.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-sm">No actions found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.size === actions.length && actions.length > 0}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-slate-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <button className="flex items-center gap-1 hover:text-slate-700">
                Action
                <ChevronDown className="w-3 h-3" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Criterion
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Impact
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <button className="flex items-center gap-1 hover:text-slate-700">
                Due Date
                <ChevronDown className="w-3 h-3" />
              </button>
            </th>
            <th className="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {actions.map(action => (
            <ActionRow
              key={action.id}
              action={action}
              isSelected={selectedIds.has(action.id)}
              onSelect={() => onSelectOne(action.id)}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
