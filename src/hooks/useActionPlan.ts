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

  // Fetch existing action plan draft
  const { data: existingDraft, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['action-plan-draft', assessmentRunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_plan_drafts')
        .select('*')
        .eq('assessment_run_id', assessmentRunId)
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

      return n8nApi.generateActionPlan(projectId, assessmentRunId, dbUserId)
    },
    onSuccess: (data) => {
      setDraftId(data.draftId)
      setActions(data.proposedActions || [])
      setIsGenerating(false)
    },
    onError: () => {
      setIsGenerating(false)
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

      return n8nApi.refineActionPlan(draftId, userMessage, newConversation)
    },
    onSuccess: (data) => {
      setActions(data.refinedActions || actions)
      // Only add AI response (user message already added in mutationFn)
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant', content: data.aiResponse || 'Action plan has been updated.' }
      ])
    },
    onError: (error, userMessage) => {
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
