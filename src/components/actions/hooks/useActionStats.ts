import { useMemo } from 'react'
import type { Action, ActionStats } from '../../../types/actions'

export function useActionStats(actions: Action[]): ActionStats {
  return useMemo(() => {
    const now = new Date()

    // Count overdue actions (excluding completed, cancelled, wont_fix)
    const overdue = actions.filter(
      (a) =>
        a.due_date &&
        new Date(a.due_date) < now &&
        !['completed', 'cancelled', 'wont_fix'].includes(a.action_status)
    ).length

    // Calculate potential impact from incomplete actions
    const potentialImpact = actions
      .filter((a) => !['completed', 'cancelled', 'wont_fix'].includes(a.action_status))
      .reduce((sum, a) => sum + (a.estimated_impact || 0), 0)

    return {
      total: actions.length,
      in_progress: actions.filter((a) => a.action_status === 'in_progress').length,
      completed: actions.filter((a) => a.action_status === 'completed').length,
      overdue,
      blocked: actions.filter((a) => a.action_status === 'blocked').length,
      not_started: actions.filter((a) => a.action_status === 'not_started').length,
      potential_impact: potentialImpact
    }
  }, [actions])
}
