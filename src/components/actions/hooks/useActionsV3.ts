import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Action, ActionFilters } from '../../../types/actions'

interface UseActionsOptions {
  projectId: number
  filters?: ActionFilters
}

export function useActionsV3({ projectId, filters }: UseActionsOptions) {
  const queryClient = useQueryClient()

  // Fetch actions with filters
  const { data: actions = [], isLoading, error } = useQuery({
    queryKey: ['actions-v3', projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from('actions')
        .select(`
          *,
          criterion:assessment_criteria!criterion_id(
            id,
            criterion_code,
            title,
            category
          )
        `)
        .eq('project_id', projectId)
        .order('due_date', { ascending: true, nullsFirst: false })

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('action_status', filters.status)
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.caseCategory && filters.caseCategory !== 'all') {
        query = query.eq('case_category', filters.caseCategory)
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Action[]
    },
    staleTime: 30000 // Cache for 30 seconds
  })

  // Update action mutation
  const updateAction = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Action> }) => {
      const { data, error } = await supabase
        .from('actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions-v3', projectId] })
    }
  })

  // Delete action mutation
  const deleteAction = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('actions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions-v3', projectId] })
    }
  })

  // Bulk update actions
  const bulkUpdateActions = useMutation({
    mutationFn: async ({
      actionIds,
      updates
    }: {
      actionIds: number[]
      updates: Partial<Action>
    }) => {
      const { error } = await supabase
        .from('actions')
        .update(updates)
        .in('id', actionIds)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions-v3', projectId] })
    }
  })

  return {
    actions,
    isLoading,
    error,
    updateAction: updateAction.mutateAsync,
    deleteAction: deleteAction.mutateAsync,
    bulkUpdateActions: bulkUpdateActions.mutateAsync
  }
}
