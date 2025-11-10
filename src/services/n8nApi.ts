/**
 * N8N API Service
 * Handles all webhook calls to N8N backend for action plan management
 */

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
      projectId,
      assessmentRunId,
      userId,
      selectedFindings: [] // Empty array means "all RED/AMBER findings"
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
      draftId,
      userMessage,
      conversationHistory
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
      draftId,
      userId,
      finalActions
    })
  },

  /**
   * Get actions for a project with optional filters
   */
  getActions: async (
    projectId: number,
    filters: {
      status?: string
      assignedTo?: number
      priority?: string
    } = {}
  ) => {
    return callN8N({
      identifier: 'get_actions',
      projectId,
      filters
    })
  },

  /**
   * Update a single action
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
    return callN8N({
      identifier: 'update_action',
      actionId,
      updates,
      changedBy
    })
  },

  /**
   * Bulk update multiple actions
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
    return callN8N({
      identifier: 'bulk_update_actions',
      actionIds,
      updates,
      changedBy
    })
  },

  /**
   * Get detailed action information including history and comments
   */
  getActionDetails: async (actionId: number) => {
    return callN8N({
      identifier: 'get_action_details',
      actionId
    })
  },

  /**
   * Add a comment to an action
   */
  addComment: async (
    actionId: number,
    userId: number,
    commentText: string,
    mentions: number[] = [],
    parentCommentId: number | null = null
  ) => {
    return callN8N({
      identifier: 'add_comment',
      actionId,
      userId,
      commentText,
      mentions,
      parentCommentId
    })
  },

  /**
   * Compare assessment versions
   */
  compareAssessments: async (newAssessmentRunId: number, projectId: number) => {
    return callN8N({
      identifier: 'compare_assessments',
      newAssessmentRunId,
      projectId
    })
  }
}

export default n8nApi
