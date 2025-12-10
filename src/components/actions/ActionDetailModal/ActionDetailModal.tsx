import { X } from 'lucide-react'
import { useState } from 'react'
import type { Action } from '../../../types/actions'
import LinkedCriterionCard from './LinkedCriterionCard'
import ActivityFeed from './ActivityFeed'
import CommentInput from './CommentInput'
import MetadataSidebar from './MetadataSidebar'
import PriorityBadge from '../ActionsTable/cells/PriorityBadge'
import StatusBadge from '../ActionsTable/cells/StatusBadge'

interface ActionDetailModalProps {
  action: Action
  isOpen: boolean
  onClose: () => void
  onUpdate: (updates: Partial<Action>) => Promise<void>
  onDelete: () => Promise<void>
}

export default function ActionDetailModal({
  action,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}: ActionDetailModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [localAction, setLocalAction] = useState<Action>(action)
  const [hasChanges, setHasChanges] = useState(false)

  if (!isOpen) return null

  const handleUpdate = (updates: Partial<Action>) => {
    setLocalAction({ ...localAction, ...updates })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(localAction)
      setHasChanges(false)
      onClose()
    } catch (error) {
      console.error('Failed to save action:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this action? This cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      console.error('Failed to delete action:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between">
          <div className="flex-1 pr-4">
            {/* Priority + Status Badges */}
            <div className="flex items-center gap-2 mb-2">
              <PriorityBadge priority={localAction.priority} />
              <StatusBadge status={localAction.action_status} />
            </div>
            {/* Title */}
            <h2 className="text-xl font-bold text-navy">{localAction.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">

              {/* Left Column: Description & Details */}
              <div className="col-span-2 space-y-6">

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {localAction.description || 'No description provided'}
                  </p>
                </div>

                {/* Linked Criterion Card */}
                <LinkedCriterionCard criterionId={localAction.criterion_id} />

                {/* Dependency Warning (if blocked) */}
                {localAction.action_status === 'blocked' && localAction.blocked_by_action_id && (
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <X className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-800">Blocked by another action</p>
                        <p className="text-xs text-purple-600 mt-0.5">
                          This action is waiting on: Action #{localAction.blocked_by_action_id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity & Comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Activity
                  </label>

                  {/* Comment Input */}
                  <CommentInput actionId={localAction.id} />

                  {/* Activity Feed */}
                  <ActivityFeed actionId={localAction.id} />
                </div>

              </div>

              {/* Right Column: Metadata Sidebar */}
              <MetadataSidebar
                action={localAction}
                onUpdate={handleUpdate}
              />

            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete Action
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-4 py-2 bg-navy hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
