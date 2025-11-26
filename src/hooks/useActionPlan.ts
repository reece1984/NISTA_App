import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { n8nApi } from '../services/n8nApi'
import { apiAdapter } from '../services/apiAdapter'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export interface DraftAction {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  suggestedDueDate?: string
  linkedAssessmentIds: number[]
  criteriaCategory?: string
  assignedTo?: number
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useActionPlan(assessmentRunId: number, projectId: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [draftId, setDraftId] = useState<number | null>(null)
  const [actions, setActions] = useState<DraftAction[]>([])
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null)

  // Fetch existing action plan draft (only drafts that haven't been confirmed yet)
  const { data: existingDraft, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['action-plan-draft', assessmentRunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_plan_drafts')
        .select('*')
        .eq('assessment_run_id', assessmentRunId)
        .eq('draft_status', 'editing')  // Only fetch unconfirmed drafts (status is 'editing', not 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    }
  })

  // Load existing draft data when fetched
  useEffect(() => {
    if (existingDraft) {
      setDraftId(existingDraft.id)
      if (existingDraft.draft_data?.proposedActions) {
        // Transform snake_case from database to camelCase for frontend
        const transformedActions = existingDraft.draft_data.proposedActions.map((action: any) => ({
          title: action.title,
          description: action.description,
          priority: action.priority,
          suggestedDueDate: action.suggested_due_date || action.suggestedDueDate,
          linkedAssessmentIds: action.linked_assessment_ids || action.linkedAssessmentIds || [],
          criteriaCategory: action.criteria_category || action.criteriaCategory,
          assignedTo: action.assigned_to || action.assignedTo
        }))
        setActions(transformedActions)
      }
      if (existingDraft.conversation_history) {
        setConversationHistory(existingDraft.conversation_history)
      }
    }
  }, [existingDraft])

  // Generate action plan mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true)
      setGenerationProgress({ current: 0, total: 100 })

      // Cancel any existing drafts for this assessment run
      const { error: cancelError } = await supabase
        .from('action_plan_drafts')
        .update({ draft_status: 'cancelled' })
        .eq('assessment_run_id', assessmentRunId)
        .eq('draft_status', 'editing')

      if (cancelError) {
        console.warn('Failed to cancel existing drafts:', cancelError)
      }

      // Clear local state
      setDraftId(null)
      setActions([])
      setConversationHistory([])

      // Invalidate and refetch the existing draft query
      await queryClient.invalidateQueries({ queryKey: ['action-plan-draft', assessmentRunId] })
      await queryClient.refetchQueries({ queryKey: ['action-plan-draft', assessmentRunId] })

      // Get the database user ID from the users table
      let dbUserId: number | undefined
      if (user?.id) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('open_id', user.id)
          .single()
        dbUserId = userData?.id
      }

      // Trigger N8N workflow (don't await - it's asynchronous)
      n8nApi.generateActionPlan(projectId, assessmentRunId, dbUserId)

      // Poll for draft creation (N8N creates it asynchronously)
      return new Promise((resolve, reject) => {
        let pollCount = 0
        const maxPolls = 60 // 60 polls × 2 seconds = 2 minutes max

        const pollInterval = setInterval(async () => {
          pollCount++
          setGenerationProgress({ current: Math.min(pollCount * 5, 95), total: 100 })

          // Check if draft has been created
          const { data: draftData } = await supabase
            .from('action_plan_drafts')
            .select('*')
            .eq('assessment_run_id', assessmentRunId)
            .eq('draft_status', 'editing')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (draftData?.draft_data?.proposedActions || pollCount >= maxPolls) {
            clearInterval(pollInterval)
            setGenerationProgress({ current: 100, total: 100 })

            if (draftData) {
              setDraftId(draftData.id)
              if (draftData.draft_data?.proposedActions) {
                const transformedActions = draftData.draft_data.proposedActions.map((action: any) => ({
                  title: action.title,
                  description: action.description,
                  priority: action.priority,
                  suggestedDueDate: action.suggested_due_date || action.suggestedDueDate,
                  linkedAssessmentIds: action.linked_assessment_ids || action.linkedAssessmentIds || [],
                  criteriaCategory: action.criteria_category || action.criteriaCategory,
                  assignedTo: action.assigned_to || action.assignedTo
                }))
                setActions(transformedActions)
              }
              resolve(draftData)
            } else {
              reject(new Error('Timeout waiting for action plan generation'))
            }

            setIsGenerating(false)
            setGenerationProgress(null)
          }
        }, 2000) // Poll every 2 seconds
      })
    },
    onError: (error) => {
      console.error('Failed to generate action plan:', error)
      setIsGenerating(false)
      setGenerationProgress(null)
    }
  })

  // Refine action plan mutation
  const refineMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      if (!draftId) throw new Error('No draft ID available')

      // Add user message to history immediately for UI feedback
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage }
      ])

      const newConversation = [
        ...conversationHistory,
        { role: 'user' as const, content: userMessage }
      ]

      // Trigger N8N workflow
      const response = await n8nApi.refineActionPlan(draftId, userMessage, newConversation)
      console.log('N8N refine response:', response)

      // Poll for updated draft (N8N updates asynchronously)
      let pollCount = 0
      const maxPolls = 30 // 30 polls × 1 second = 30 seconds max

      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          pollCount++

          // Check if draft has been updated
          const { data: updatedDraft } = await supabase
            .from('action_plan_drafts')
            .select('*')
            .eq('id', draftId)
            .single()

          // Check if the conversation history has been updated (indicating N8N processed the request)
          const historyLength = updatedDraft?.conversation_history?.length || 0
          const expectedLength = newConversation.length + 1 // +1 for AI response

          if (historyLength >= expectedLength || pollCount >= maxPolls) {
            clearInterval(pollInterval)

            if (updatedDraft) {
              // Transform and update actions
              if (updatedDraft.draft_data?.proposedActions) {
                const transformedActions = updatedDraft.draft_data.proposedActions.map((action: any) => ({
                  title: action.title,
                  description: action.description,
                  priority: action.priority,
                  suggestedDueDate: action.suggested_due_date || action.suggestedDueDate,
                  linkedAssessmentIds: action.linked_assessment_ids || action.linkedAssessmentIds || [],
                  criteriaCategory: action.criteria_category || action.criteriaCategory,
                  assignedTo: action.assigned_to || action.assignedTo
                }))
                setActions(transformedActions)
              }

              // Update conversation history
              if (updatedDraft.conversation_history) {
                setConversationHistory(updatedDraft.conversation_history)
              }

              resolve({
                aiResponse: updatedDraft.conversation_history?.[updatedDraft.conversation_history.length - 1]?.content || 'Action plan has been updated.',
                ...response
              })
            } else {
              resolve(response)
            }
          }
        }, 1000) // Poll every second
      })
    },
    onSuccess: (data) => {
      // Conversation history and actions are already updated in mutationFn via polling
      console.log('Refinement complete:', data)
    },
    onError: (error) => {
      console.error('Failed to refine action plan:', error)
      // Remove the user message that was optimistically added
      setConversationHistory(prev => prev.slice(0, -1))
    }
  })

  // Confirm action plan mutation
  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!draftId) throw new Error('Missing draft ID')

      // Get the database user ID from the users table
      let dbUserId: number | undefined
      if (user?.id) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('open_id', user.id)
          .single()
        dbUserId = userData?.id
      }

      if (!dbUserId) throw new Error('User not found in database')

      // Call Express API instead of N8N for database transaction
      return apiAdapter.confirmActionPlan(draftId, dbUserId)
    },
    onSuccess: (data) => {
      console.log(`Successfully created ${data.createdActionCount} actions`)
      // Invalidate actions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['actions'] })
    }
  })

  // Auto-save draft (debounced)
  const saveDraft = async () => {
    setIsSaving(true)
    // In a real implementation, you might want to call a save_draft endpoint
    // For now, we'll just simulate a save
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
  }

  // Manual action manipulation
  const updateAction = (index: number, updates: Partial<DraftAction>) => {
    setActions(prev => {
      const newActions = [...prev]
      newActions[index] = { ...newActions[index], ...updates }
      return newActions
    })
  }

  const addAction = (action: DraftAction) => {
    setActions(prev => [...prev, action])
  }

  const deleteAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index))
  }

  return {
    // State
    draftId,
    actions,
    conversationHistory,
    isGenerating,
    isSaving,
    existingDraft,
    generationProgress,

    // Mutations
    generateActionPlan: generateMutation.mutate,
    refineActionPlan: refineMutation.mutateAsync,
    confirmActionPlan: confirmMutation.mutateAsync,

    // Action manipulation
    updateAction,
    addAction,
    deleteAction,
    saveDraft,

    // Loading states
    isLoadingDraft,
    isRefining: refineMutation.isPending,
    isConfirming: confirmMutation.isPending,

    // Errors
    error: generateMutation.error || refineMutation.error || confirmMutation.error
  }
}
