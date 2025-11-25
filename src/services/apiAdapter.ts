/**
 * API Adapter
 * Converts between frontend camelCase and backend snake_case
 * Provides a consistent interface for both N8N and Express API calls
 */

import { api } from './api'

// Helper functions to convert between naming conventions
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      result[snakeKey] = toSnakeCase(obj[key])
      return result
    }, {} as any)
  }

  return obj
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = toCamelCase(obj[key])
      return result
    }, {} as any)
  }

  return obj
}

/**
 * Adapter that wraps the Express API and converts naming conventions
 */
export const apiAdapter = {
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
    const snakeFilters = toSnakeCase(filters)
    const result = await api.getActions(projectId, snakeFilters)
    return toCamelCase(result)
  },

  /**
   * Get detailed action information
   */
  getActionDetails: async (actionId: number) => {
    const result = await api.getActionDetails(actionId)
    return toCamelCase(result)
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
    const snakeUpdates = toSnakeCase(updates)
    const result = await api.updateAction(actionId, {
      ...snakeUpdates,
      updated_by: changedBy
    })
    return toCamelCase(result)
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
    const snakeUpdates = toSnakeCase(updates)
    const result = await api.bulkUpdateActions({
      action_ids: actionIds,
      updates: snakeUpdates,
      updated_by: changedBy
    })
    return toCamelCase(result)
  },

  /**
   * Bulk delete multiple actions
   */
  bulkDeleteActions: async (actionIds: number[]) => {
    const result = await api.bulkDeleteActions(actionIds)
    return toCamelCase(result)
  },

  /**
   * Get action history
   */
  getActionHistory: async (actionId: number) => {
    const result = await api.getActionHistory(actionId)
    return toCamelCase(result)
  },

  /**
   * Get all comments for an action
   */
  getComments: async (actionId: number) => {
    const result = await api.getComments(actionId)
    return toCamelCase(result)
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
    const result = await api.addComment(actionId, {
      user_id: userId,
      comment_text: commentText,
      mentions,
      parent_comment_id: parentCommentId || undefined
    })
    return toCamelCase(result)
  },

  /**
   * Update a comment
   */
  updateComment: async (commentId: number, commentText: string, userId: number) => {
    const result = await api.updateComment(commentId, commentText, userId)
    return toCamelCase(result)
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: number, userId: number) => {
    const result = await api.deleteComment(commentId, userId)
    return toCamelCase(result)
  },

  /**
   * Confirm action plan and create actions from draft
   */
  confirmActionPlan: async (draftId: number, userId: number) => {
    const result = await api.confirmActionPlan(draftId, userId)
    return toCamelCase(result)
  }
}

export default apiAdapter
