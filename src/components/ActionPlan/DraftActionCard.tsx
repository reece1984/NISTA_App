import { useState } from 'react'
import { Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react'
import type { DraftAction } from '../../hooks/useActionPlan'
import PriorityBadge from '../shared/PriorityBadge'
import UserSelect from '../shared/UserSelect'
import { cn } from '../../lib/utils'

interface DraftActionCardProps {
  action: DraftAction
  index: number
  onUpdate: (index: number, updates: Partial<DraftAction>) => void
  onDelete: (index: number) => void
  className?: string
}

export default function DraftActionCard({
  action,
  index,
  onUpdate,
  onDelete,
  className
}: DraftActionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [editedAction, setEditedAction] = useState(action)

  const handleSave = () => {
    onUpdate(index, editedAction)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedAction(action)
    setIsEditing(false)
  }

  const priorityOptions: Array<DraftAction['priority']> = ['low', 'medium', 'high', 'critical']

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editedAction.title}
              onChange={(e) => setEditedAction({ ...editedAction, title: e.target.value })}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              placeholder="Action title..."
            />
          ) : (
            <h3 className="font-semibold text-gray-900 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
              {index + 1}. {action.title}
            </h3>
          )}

          {/* Category Badge */}
          {action.criteriaCategory && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
              {action.criteriaCategory}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Save"
              >
                <Save size={16} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(index)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Compact Info Row */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {/* Priority */}
        {isEditing ? (
          <select
            value={editedAction.priority}
            onChange={(e) => setEditedAction({ ...editedAction, priority: e.target.value as DraftAction['priority'] })}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorityOptions.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        ) : (
          <PriorityBadge priority={action.priority} />
        )}

        {/* Owner */}
        {isEditing ? (
          <div className="flex-1 min-w-[200px]">
            <UserSelect
              value={editedAction.assignedTo || null}
              onChange={(userId) => setEditedAction({ ...editedAction, assignedTo: userId || undefined })}
              placeholder="Assign to..."
              className="w-full"
            />
          </div>
        ) : (
          <span className="text-gray-600">
            @{action.assignedTo ? 'Assigned' : 'Unassigned'}
          </span>
        )}

        {/* Due Date */}
        {isEditing ? (
          <input
            type="date"
            value={editedAction.suggestedDueDate || ''}
            onChange={(e) => setEditedAction({ ...editedAction, suggestedDueDate: e.target.value })}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : action.suggestedDueDate ? (
          <span className="text-gray-600">
            📅 {new Date(action.suggestedDueDate).toLocaleDateString()}
          </span>
        ) : null}

        {/* Linked Findings Count */}
        {action.linkedAssessmentIds.length > 0 && (
          <span className="flex items-center gap-1 text-gray-500">
            <LinkIcon size={14} />
            {action.linkedAssessmentIds.length} finding{action.linkedAssessmentIds.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Expanded Description */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {isEditing ? (
            <textarea
              value={editedAction.description}
              onChange={(e) => setEditedAction({ ...editedAction, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Describe the action in detail..."
            />
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{action.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
