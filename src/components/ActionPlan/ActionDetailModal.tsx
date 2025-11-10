import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Trash2, Send, Loader2 } from 'lucide-react'
import { n8nApi } from '../../services/n8nApi'
import { useAuth } from '../../contexts/AuthContext'
import type { Action } from '../../hooks/useActions'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import PriorityBadge from '../shared/PriorityBadge'
import StatusBadge from '../shared/StatusBadge'
import UserSelect from '../shared/UserSelect'
import CommentThread from '../shared/CommentThread'
import { format, parseISO } from 'date-fns'

interface ActionDetailModalProps {
  actionId: number
  onClose: () => void
  onUpdate?: () => void
}

export default function ActionDetailModal({
  actionId,
  onClose,
  onUpdate
}: ActionDetailModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch action details
  const { data: actionData, isLoading } = useQuery({
    queryKey: ['action-details', actionId],
    queryFn: () => n8nApi.getActionDetails(actionId),
    refetchOnWindowFocus: false
  })

  const action = actionData?.action

  // Local edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editedAction, setEditedAction] = useState<Partial<Action>>({})
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    if (action) {
      setEditedAction({
        title: action.title,
        description: action.description,
        actionStatus: action.actionStatus,
        priority: action.priority,
        assignedTo: action.assignedTo?.id,
        dueDate: action.dueDate
      })
    }
  }, [action])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!user?.id) throw new Error('User not authenticated')
      return n8nApi.updateAction(actionId, updates, parseInt(user.id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-details', actionId] })
      queryClient.invalidateQueries({ queryKey: ['actions'] })
      setIsEditing(false)
      onUpdate?.()
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      return n8nApi.updateAction(actionId, { actionStatus: 'wont_fix' }, parseInt(user.id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] })
      onClose()
      onUpdate?.()
    }
  })

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')

      // Parse @mentions from comment text
      const mentions: number[] = []
      const mentionRegex = /@(\S+)/g
      let match
      while ((match = mentionRegex.exec(newComment)) !== null) {
        // In a real app, you'd look up user IDs by name/email
        // For now, we'll just pass empty mentions array
      }

      return n8nApi.addComment(
        actionId,
        parseInt(user.id),
        newComment,
        mentions
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-details', actionId] })
      setNewComment('')
    }
  })

  const handleSave = () => {
    const updates: any = {}
    if (editedAction.title !== action.title) updates.title = editedAction.title
    if (editedAction.description !== action.description) updates.description = editedAction.description
    if (editedAction.actionStatus !== action.actionStatus) updates.actionStatus = editedAction.actionStatus
    if (editedAction.priority !== action.priority) updates.priority = editedAction.priority
    if (editedAction.assignedTo !== action.assignedTo?.id) updates.assignedTo = editedAction.assignedTo
    if (editedAction.dueDate !== action.dueDate) updates.dueDate = editedAction.dueDate

    if (Object.keys(updates).length > 0) {
      updateMutation.mutate(updates)
    } else {
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this action? This will mark it as "Won\'t Fix".')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Action Details" size="lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </Modal>
    )
  }

  if (!action) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Action Details" size="lg">
        <div className="text-center py-12 text-gray-500">
          Action not found
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Action Details"
      size="lg"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedAction.title || ''}
              onChange={(e) => setEditedAction({ ...editedAction, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h2 className="text-xl font-semibold text-gray-900">{action.title}</h2>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editedAction.description || ''}
              onChange={(e) => setEditedAction({ ...editedAction, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{action.description}</p>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            {isEditing ? (
              <UserSelect
                value={editedAction.assignedTo || null}
                onChange={(userId) => setEditedAction({ ...editedAction, assignedTo: userId || undefined })}
              />
            ) : (
              <div className="text-gray-900">
                {action.assignedTo ? action.assignedTo.email : 'Unassigned'}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                value={editedAction.actionStatus || ''}
                onChange={(e) => setEditedAction({ ...editedAction, actionStatus: e.target.value as Action['actionStatus'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="wont_fix">Won't Fix</option>
              </select>
            ) : (
              <StatusBadge status={action.actionStatus} />
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            {isEditing ? (
              <select
                value={editedAction.priority || ''}
                onChange={(e) => setEditedAction({ ...editedAction, priority: e.target.value as Action['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <PriorityBadge priority={action.priority} />
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={editedAction.dueDate || ''}
                onChange={(e) => setEditedAction({ ...editedAction, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="text-gray-900">
                {action.dueDate ? format(parseISO(action.dueDate), 'MMMM d, yyyy') : 'Not set'}
              </div>
            )}
          </div>
        </div>

        {/* Related Findings */}
        {action.linkedFindings && action.linkedFindings.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📎 Related Findings
            </label>
            <div className="space-y-2">
              {action.linkedFindings.map((finding: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-gray-900">{finding.criterionCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        finding.ragRating === 'red'
                          ? 'bg-red-100 text-red-700'
                          : finding.ragRating === 'amber'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {finding.ragRating?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{finding.finding}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {action.history && action.history.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📜 History
            </label>
            <div className="space-y-2">
              {action.history.map((item: any, idx: number) => (
                <div key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <div>
                    <span className="font-medium">{item.changedBy.name || item.changedBy.email}</span>
                    {' '}changed{' '}
                    <span className="font-medium">{item.fieldChanged}</span>
                    {' '}from{' '}
                    <span className="bg-gray-100 px-1 rounded">{item.oldValue}</span>
                    {' '}to{' '}
                    <span className="bg-gray-100 px-1 rounded">{item.newValue}</span>
                    <span className="text-gray-400 ml-2">
                      {format(parseISO(item.changedAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            💬 Comments ({action.comments?.length || 0})
          </label>

          <CommentThread comments={action.comments || []} />

          {/* Add Comment */}
          <div className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @name to mention someone"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={() => addCommentMutation.mutate()}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {addCommentMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Post Comment
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Action
          </Button>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Action
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
