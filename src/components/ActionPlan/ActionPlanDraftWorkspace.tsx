import { useState, useEffect, useRef } from 'react'
import { Send, Plus, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import { useActionPlan } from '../../hooks/useActionPlan'
import DraftActionCard from './DraftActionCard'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

interface ActionPlanDraftWorkspaceProps {
  assessmentRunId: number
  projectId: number
  onClose: () => void
  onConfirm: (result: any) => void
}

export default function ActionPlanDraftWorkspace({
  assessmentRunId,
  projectId,
  onClose,
  onConfirm
}: ActionPlanDraftWorkspaceProps) {
  const {
    draftId,
    actions,
    conversationHistory,
    isGenerating,
    isSaving,
    generateActionPlan,
    refineActionPlan,
    confirmActionPlan,
    updateAction,
    addAction,
    deleteAction,
    saveDraft,
    isRefining,
    isConfirming,
    isLoadingDraft,
    existingDraft,
    error
  } = useActionPlan(assessmentRunId, projectId)

  const [userMessage, setUserMessage] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Generate action plan on mount only if no existing draft
  useEffect(() => {
    if (!isLoadingDraft && !existingDraft && !hasAttemptedGeneration) {
      generateActionPlan()
      setHasAttemptedGeneration(true)
    }
  }, [isLoadingDraft, existingDraft, hasAttemptedGeneration])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!draftId) return

    const interval = setInterval(() => {
      saveDraft()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [draftId, actions])

  // Scroll to bottom of chat when conversation updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  const handleSendMessage = async () => {
    if (!userMessage.trim() || isRefining) return

    try {
      await refineActionPlan(userMessage)
      setUserMessage('')
    } catch (err) {
      console.error('Failed to refine action plan:', err)
    }
  }

  const handleConfirm = async () => {
    try {
      const result = await confirmActionPlan()
      onConfirm(result)
      setShowConfirmDialog(false)
    } catch (err) {
      console.error('Failed to confirm action plan:', err)
    }
  }

  const handleAddManualAction = () => {
    addAction({
      title: 'New Action',
      description: 'Describe this action...',
      priority: 'medium',
      linkedAssessmentIds: [],
      criteriaCategory: 'Other'
    })
  }

  // Group actions by category
  const groupedActions = actions.reduce((acc, action, index) => {
    const category = action.criteriaCategory || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push({ action, index })
    return acc
  }, {} as Record<string, Array<{ action: any; index: number }>>)

  // Quick prompt suggestions
  const quickPrompts = [
    'Make actions more specific',
    'Add due dates to all actions',
    'Break large actions into sub-tasks',
    'Add suggested owners based on skill requirements'
  ]

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Draft Action Plan - Assessment Run #${assessmentRunId}`}
      size="xl"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Header Stats */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-900">
              {actions.length} action{actions.length !== 1 ? 's' : ''} proposed
            </span>
            {isSaving && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </span>
            )}
          </div>
          <button
            onClick={handleAddManualAction}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Action Manually
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {isLoadingDraft || isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
              <p className="text-lg font-medium text-gray-900">
                {isLoadingDraft ? 'Loading action plan...' : 'Generating action plan...'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isLoadingDraft ? 'Fetching existing draft' : 'Analyzing assessment findings with AI'}
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error generating action plan</p>
              <p className="text-red-600 text-sm mt-1">{String(error)}</p>
            </div>
          ) : (
            <>
              {/* Grouped Action Cards */}
              {Object.entries(groupedActions).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {items.length}
                    </span>
                    {category}
                  </h3>
                  {items.map(({ action, index }) => (
                    <DraftActionCard
                      key={index}
                      action={action}
                      index={index}
                      onUpdate={updateAction}
                      onDelete={deleteAction}
                    />
                  ))}
                </div>
              ))}

              {actions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No actions generated yet.</p>
                  <button
                    onClick={handleAddManualAction}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add your first action
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Refinement Chat */}
        {!isGenerating && actions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles size={16} className="text-blue-600" />
              Refine this action plan
            </div>

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-2 mb-3">
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-sm p-2 rounded ${
                      msg.role === 'user'
                        ? 'bg-blue-50 text-blue-900 ml-8'
                        : 'bg-gray-50 text-gray-900 mr-8'
                    }`}
                  >
                    <span className="font-semibold">
                      {msg.role === 'user' ? 'You' : 'AI'}:
                    </span>{' '}
                    {msg.content}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserMessage(prompt)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type your refinement request..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isRefining}
              />
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim() || isRefining}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isRefining ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => saveDraft()}
              disabled={isSaving || !draftId}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowConfirmDialog(true)}
              disabled={actions.length === 0 || isConfirming}
              className="flex items-center gap-2"
            >
              {isConfirming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Actions...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm & Create Actions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Modal
          isOpen={true}
          onClose={() => setShowConfirmDialog(false)}
          title="Confirm Action Plan"
          size="sm"
        >
          <p className="text-gray-700 mb-6">
            Are you sure you want to create {actions.length} action{actions.length !== 1 ? 's' : ''}?
            This will convert the draft into active actions that can be tracked and managed.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="flex-1"
              disabled={isConfirming}
            >
              {isConfirming ? 'Creating...' : 'Confirm'}
            </Button>
          </div>
        </Modal>
      )}
    </Modal>
  )
}
