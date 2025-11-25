/**
 * Express API Service
 * Handles all CRUD operations for actions and comments
 * Calls Express backend instead of N8N for non-AI operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function callAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || `API Error: ${response.status}`);
  }

  return data.data as T;
}

// ===== Types =====

export interface Action {
  id: number;
  project_id: number;
  source_assessment_run_id?: number;
  title: string;
  description: string | null;
  action_status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: {
    id: number;
    name: string;
    email: string;
  } | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  comment_count?: number;
  linked_findings?: Array<{
    assessment_id: number;
    criterion_code: string;
    rag_rating: string;
  }>;
}

export interface ActionDetails extends Action {
  created_by: {
    id: number;
    name: string;
  } | null;
  updated_by: {
    id: number;
    name: string;
  } | null;
  history: Array<{
    id: number;
    field_changed: string;
    old_value: string;
    new_value: string;
    changed_at: string;
    changed_by: {
      id: number;
      name: string;
      email: string;
    } | null;
  }>;
  comments: Comment[];
}

export interface Comment {
  id: number;
  action_id: number;
  comment_text: string;
  parent_comment_id: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  mentions: Array<{
    user_id: number;
    user_name: string;
    user_email: string;
  }>;
  replies: Comment[];
}

export interface ActionFilters {
  status?: string;
  priority?: string;
  assigned_to?: number;
}

export interface ActionUpdate {
  title?: string;
  description?: string;
  action_status?: Action['action_status'];
  priority?: Action['priority'];
  assigned_to?: number;
  due_date?: string;
  completed_at?: string;
  updated_by: number;
}

export interface BulkActionUpdate {
  action_ids: number[];
  updates: Omit<ActionUpdate, 'updated_by'>;
  updated_by: number;
}

export interface CreateComment {
  user_id: number;
  comment_text: string;
  parent_comment_id?: number;
  mentions?: number[];
}

// ===== API Methods =====

export const api = {
  /**
   * Health check - verify API is running
   */
  healthCheck: async () => {
    return callAPI<{
      status: string;
      timestamp: string;
      database: { status: string; response_time_ms: number };
    }>('/api/health');
  },

  // ===== Actions =====

  /**
   * Get all actions for a project with optional filters
   */
  getActions: async (projectId: number, filters?: ActionFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());

    const queryString = params.toString();
    const endpoint = `/api/projects/${projectId}/actions${queryString ? `?${queryString}` : ''}`;

    return callAPI<Action[]>(endpoint);
  },

  /**
   * Get detailed action information
   */
  getActionDetails: async (actionId: number) => {
    return callAPI<ActionDetails>(`/api/actions/${actionId}`);
  },

  /**
   * Update a single action
   */
  updateAction: async (actionId: number, updates: ActionUpdate) => {
    return callAPI<Action>(`/api/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Bulk update multiple actions
   */
  bulkUpdateActions: async (data: BulkActionUpdate) => {
    return callAPI<{ updated_count: number; updated_ids: number[] }>('/api/actions/bulk', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Bulk delete multiple actions
   */
  bulkDeleteActions: async (actionIds: number[]) => {
    return callAPI<{ deleted_count: number; deleted_ids: number[] }>('/api/actions/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ action_ids: actionIds }),
    });
  },

  /**
   * Get action history
   */
  getActionHistory: async (actionId: number) => {
    return callAPI<ActionDetails['history']>(`/api/actions/${actionId}/history`);
  },

  // ===== Comments =====

  /**
   * Get all comments for an action
   */
  getComments: async (actionId: number) => {
    return callAPI<Comment[]>(`/api/actions/${actionId}/comments`);
  },

  /**
   * Add a comment to an action
   */
  addComment: async (actionId: number, comment: CreateComment) => {
    return callAPI<Comment>(`/api/actions/${actionId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },

  /**
   * Update a comment
   */
  updateComment: async (commentId: number, commentText: string, userId: number) => {
    return callAPI<Comment>(`/api/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ comment_text: commentText, user_id: userId }),
    });
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: number, userId: number) => {
    return callAPI<{ message: string }>(`/api/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // ===== Action Plan Confirmation =====

  /**
   * Confirm action plan and create actions from draft
   * This is a database transaction, not an AI operation
   */
  confirmActionPlan: async (draftId: number, userId: number) => {
    return callAPI<{
      created_action_count: number;
      action_ids: number[];
      errors?: Array<{ title: string; error: string }>;
    }>('/api/actions/confirm', {
      method: 'POST',
      body: JSON.stringify({ draft_id: draftId, user_id: userId }),
    });
  },
};

export default api;
