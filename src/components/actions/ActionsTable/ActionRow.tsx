import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { Action } from '../../../types/actions'
import CriterionCell from './cells/CriterionCell'
import StatusBadge from './cells/StatusBadge'
import PriorityBadge from './cells/PriorityBadge'
import ImpactBadge from './cells/ImpactBadge'
import OwnerCell from './cells/OwnerCell'
import DueDateCell from './cells/DueDateCell'

interface ActionRowProps {
  action: Action
  isSelected: boolean
  onSelect: () => void
  onOpenDetail: (action: Action) => void
}

export default function ActionRow({ action, isSelected, onSelect, onOpenDetail }: ActionRowProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Determine visual states
  const isOverdue = action.due_date &&
    new Date(action.due_date) < new Date() &&
    !['completed', 'cancelled', 'wont_fix'].includes(action.action_status)

  const isBlocked = action.action_status === 'blocked'
  const isCompleted = action.action_status === 'completed'

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking checkbox or menu
    if ((e.target as HTMLElement).closest('input, button')) {
      return
    }
    onOpenDetail(action)
  }

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        'cursor-pointer transition-colors',
        isBlocked && 'bg-purple-50/30',
        !isBlocked && 'hover:bg-slate-50'
      )}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-slate-300"
          onClick={e => e.stopPropagation()}
        />
      </td>

      {/* Action Title */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              'text-sm font-medium text-slate-900',
              isCompleted && 'line-through decoration-slate-300'
            )}
          >
            {action.title}
          </span>
          {action.description && (
            <span className="text-xs text-slate-500 line-clamp-1">
              {action.description}
            </span>
          )}
        </div>
      </td>

      {/* Criterion */}
      <td className="px-4 py-3">
        <CriterionCell criterionId={action.criterion_id} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={action.action_status} />
      </td>

      {/* Priority */}
      <td className="px-4 py-3">
        <PriorityBadge priority={action.priority} />
      </td>

      {/* Impact */}
      <td className="px-4 py-3">
        <ImpactBadge impact={action.estimated_impact} />
      </td>

      {/* Owner */}
      <td className="px-4 py-3">
        <OwnerCell assignedTo={action.assigned_to} />
      </td>

      {/* Due Date */}
      <td className="px-4 py-3">
        <DueDateCell dueDate={action.due_date} isOverdue={isOverdue} />
      </td>

      {/* Menu */}
      <td className="px-4 py-3">
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                <button className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                  Edit
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                  Duplicate
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
