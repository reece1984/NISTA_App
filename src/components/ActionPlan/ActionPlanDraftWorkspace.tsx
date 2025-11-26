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
    error,
    generationProgress
  } = useActionPlan(assessmentRunId, projectId)

  const [userMessage, setUserMessage] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Generate action plan on mount
  // The generateActionPlan function handles cancelling existing drafts automatically
  useEffect(() => {
    if (!isLoadingDraft && !hasAttemptedGeneration) {
      generateActionPlan()
      setHasAttemptedGeneration(true)
    }
  }, [isLoadingDraft, hasAttemptedGeneration, generateActionPlan])

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
      title="Draft Action Plan"
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
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            title="Add a new action manually"
          >
            <Plus size={16} />
            Add Action Manually
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {isLoadingDraft || isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-accent mb-4" />
              <p className="text-lg font-medium text-gray-900">
                {isLoadingDraft ? 'Loading action plan...' : 'Generating action plan...'}
              </p>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                {isLoadingDraft ? 'Fetching existing draft' : 'Analyzing assessment findings with AI'}
              </p>

              {/* Progress Bar - only show during generation */}
              {isGenerating && generationProgress && (
                <div className="w-full max-w-md">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">
                          Generating actions...
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {generationProgress.current}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                          style={{
                            width: `${generationProgress.current}%`
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      This may take 1-2 minutes depending on assessment size
                    </p>
                  </div>
                </div>
              )}
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
                    <span className="flex-shrink-0 w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs font-bold">
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
                    className="mt-4 text-accent hover:text-blue-700 font-medium"
                  >
                    Add your first action
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Refinement Chat - Compact */}
        {!isGenerating && actions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 bg-gray-50 -mx-6 px-6 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-accent" />
              <h4 className="text-xs font-semibold text-gray-700">Refine with AI</h4>
            </div>

            {/* Compact Chat History - Only last 2 messages */}
            {conversationHistory.length > 0 && (
              <div className="space-y-1 mb-2">
                {conversationHistory.slice(-2).map((msg, idx) => (
                  <div key={idx} className="flex gap-2 text-xs">
                    <span className="font-semibold text-gray-600 min-w-[45px] flex-shrink-0">
                      {msg.role === 'user' ? 'You:' : 'AI:'}
                    </span>
                    <span className="text-gray-500 line-clamp-1">{msg.content}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Compact Input */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask AI to refine..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isRefining}
              />
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim() || isRefining}
                className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                title="Send message"
              >
                {isRefining ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">Refining...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span className="text-xs">Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Compact Quick Prompts */}
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserMessage(prompt)}
                  disabled={isRefining}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:border-accent hover:bg-accent/5 text-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
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
              title="Save current draft"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isConfirming || actions.length === 0}
              className="flex items-center gap-2"
              title="Confirm and create actions from this draft"
            >
              <CheckCircle2 size={16} />
              Confirm & Create Actions
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
