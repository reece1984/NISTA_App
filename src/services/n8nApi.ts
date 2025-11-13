/**
 * N8N API Service
 * Handles AI-powered operations via N8N webhooks
 * CRUD operations now use Express API via apiAdapter
 */

import { apiAdapter } from './apiAdapter'

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ||
  import.meta.env.VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK

interface N8NPayload {
  identifier: string
  [key: string]: any
}

async function callN8N(payload: N8NPayload): Promise<any> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N webhook URL not configured. Please add VITE_N8N_WEBHOOK_URL to your environment variables.')
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`N8N API Error (${response.status}): ${errorText}`)
  }

  return response.json()
}

// ===== Action Plan API Methods =====

export const n8nApi = {
  /**
   * Generate initial action plan from assessment results
   */
  generateActionPlan: async (projectId: number, assessmentRunId: number, userId?: number) => {
    return callN8N({
      identifier: 'generate_action_plan',
      project_id: projectId,
      assessment_run_id: assessmentRunId,
      user_id: userId,
      selected_findings: [] // Empty array means "all RED/AMBER findings"
    })
  },

  /**
   * Refine action plan through AI conversation
   */
  refineActionPlan: async (
    draftId: number,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>
  ) => {
    return callN8N({
      identifier: 'refine_action_plan',
      draft_id: draftId,
      user_message: userMessage,
      conversation_history: conversationHistory
    })
  },

  /**
   * Confirm and create final actions from draft
   */
  confirmActionPlan: async (
    draftId: number,
    userId: number,
    finalActions: Array<{
      title: string
      description: string
      priority: string
      assignedTo?: number
      dueDate?: string
      linkedAssessmentIds: number[]
    }>
  ) => {
    return callN8N({
      identifier: 'confirm_action_plan',
      draft_id: draftId,
      user_id: userId,
      final_actions: finalActions
    })
  },

  /**
   * Get actions for a project with optional filters
   * Now uses Express API instead of N8N
   */
  getActions: async (
    projectId: number,
    filters: {
      status?: string
      assignedTo?: number
      priority?: string
    } = {}
  ) => {
    return apiAdapter.getActions(projectId, filters)
  },

  /**
   * Update a single action
   * Now uses Express API instead of N8N
   */
  updateAction: async (
    actionId: number,
    updates: {
      title?: string
      description?: string
      actionStatus?: string
      priority?: string
      assignedTo?: number
      dueDate?: string
      completedAt?: string
    },
    changedBy: number
  ) => {
    return apiAdapter.updateAction(actionId, updates, changedBy)
  },

  /**
   * Bulk update multiple actions
   * Now uses Express API instead of N8N
   */
  bulkUpdateActions: async (
    actionIds: number[],
    updates: {
      assignedTo?: number
      priority?: string
      actionStatus?: string
      dueDate?: string
    },
    changedBy: number
  ) => {
    return apiAdapter.bulkUpdateActions(actionIds, updates, changedBy)
  },

  /**
   * Get detailed action information including history and comments
   * Now uses Express API instead of N8N
   */
  getActionDetails: async (actionId: number) => {
    return apiAdapter.getActionDetails(actionId)
  },

  /**
   * Add a comment to an action
   * Now uses Express API instead of N8N
   */
  addComment: async (
    actionId: number,
    userId: number,
    commentText: string,
    mentions: number[] = [],
    parentCommentId: number | null = null
  ) => {
    return apiAdapter.addComment(actionId, userId, commentText, mentions, parentCommentId)
  },

  /**
   * Compare assessment versions
   */
  compareAssessments: async (newAssessmentRunId: number, projectId: number) => {
    return callN8N({
      identifier: 'compare_assessments',
      new_assessment_run_id: newAssessmentRunId,
      project_id: projectId
    })
  }
}

export default n8nApi
