import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { n8nApi } from '../services/n8nApi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export interface Action {
  id: number
  title: string
  description: string
  actionStatus: 'not_started' | 'in_progress' | 'completed' | 'wont_fix'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: {
    id: number
    name: string
    email: string
  } | null
  criterion: {
    id: number
    criterionCode: string
    title: string
    category: string
  } | null
  dueDate: string | null
  completedAt: string | null
  commentCount: number
  linkedFindings: string[]
  createdAt: string
}

interface UseActionsOptions {
  projectId: number
  filters?: {
    status?: string
    assignedTo?: number
    priority?: string
  }
}

export function useActions({ projectId, filters }: UseActionsOptions) {
  console.log('🔴 useActions HOOK CALLED with projectId:', projectId, 'filters:', filters)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [localFilters, setLocalFilters] = useState(filters || {})

  // Fetch actions
  const {
    data: actions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['actions', projectId, localFilters],
    queryFn: async () => {
      console.log('🔴 useActions queryFn executing...')
      const result = await n8nApi.getActions(projectId, localFilters)
      console.log('useActions received from n8nApi:', result)
      // apiAdapter returns the actions array directly, not wrapped in { actions: [] }
      const actions = Array.isArray(result) ? result : (result.actions || [])
      console.log('useActions returning actions:', actions)
      return actions
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0
  })

  // Update action mutation
  const updateActionMutation = useMutation({
    mutationFn: async ({ actionId, updates }: { actionId: number; updates: any }) => {
      if (!user?.id) throw new Error('User not authenticated')
      return n8nApi.updateAction(actionId, updates, parseInt(user.id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions', projectId] })
    }
  })

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ actionIds, updates }: { actionIds: number[]; updates: any }) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Get the database user ID from the users table
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('open_id', user.id)
        .single()

      if (!userData) throw new Error('User not found in database')

      return n8nApi.bulkUpdateActions(actionIds, updates, userData.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions', projectId] })
    }
  })

  // Helper function to update action status
  const updateActionStatus = async (actionId: number, newStatus: Action['actionStatus']) => {
    const updates: any = { actionStatus: newStatus }
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString()
    }
    return updateActionMutation.mutateAsync({ actionId, updates })
  }

  // Helper function to update filters
  const updateFilters = (newFilters: typeof localFilters) => {
    setLocalFilters(newFilters)
  }

  return {
    actions,
    isLoading,
    error: error ? String(error) : null,
    refetch,
    updateAction: updateActionMutation.mutateAsync,
    bulkUpdate: bulkUpdateMutation.mutateAsync,
    updateActionStatus,
    updateFilters,
    filters: localFilters,
    isUpdating: updateActionMutation.isPending || bulkUpdateMutation.isPending
  }
}
